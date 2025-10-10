const Joi = require('joi');
const { Message, User, USER_ROLES } = require('../models');
const { notFound, badRequest, forbidden } = require('../utils/httpError');

const createSchema = Joi.object({
  recipientId: Joi.number().integer().positive().required(),
  subject: Joi.string().max(255).required(),
  body: Joi.string().max(5000).required()
});

const messageFilterSchema = Joi.object({
  box: Joi.string().valid('inbox', 'outbox', 'all').default('inbox')
});

const toDto = (message) => ({
  id: message.id,
  senderId: message.senderId,
  recipientId: message.recipientId,
  subject: message.subject,
  body: message.body,
  readAt: message.readAt,
  createdAt: message.createdAt,
  sender: message.sender
    ? {
        id: message.sender.id,
        email: message.sender.email,
        firstName: message.sender.firstName,
        lastName: message.sender.lastName
      }
    : undefined,
  recipient: message.recipient
    ? {
        id: message.recipient.id,
        email: message.recipient.email,
        firstName: message.recipient.firstName,
        lastName: message.recipient.lastName
      }
    : undefined
});

const createMessage = async (req, res, next) => {
  try {
    const payload = req.body;

    if (payload.recipientId === req.user.id) {
      throw badRequest('Cannot send messages to yourself');
    }

    const recipient = await User.findByPk(payload.recipientId);
    if (!recipient) {
      throw notFound('Recipient not found');
    }

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: payload.recipientId,
      subject: payload.subject,
      body: payload.body
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'recipient' }
      ]
    });

    res.status(201).json({ message: toDto(fullMessage) });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const { box } = messageFilterSchema.validate(req.query, { stripUnknown: true }).value;
    const where = {};

    if (req.user.role === USER_ROLES.ADMIN && box === 'all') {
      // Admin can see everything
    } else if (box === 'outbox') {
      where.senderId = req.user.id;
    } else {
      // default inbox
      where.recipientId = req.user.id;
    }

    const messages = await Message.findAll({
      where,
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'recipient' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ messages: messages.map((message) => toDto(message)) });
  } catch (error) {
    next(error);
  }
};

const getMessage = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'recipient' }
      ]
    });

    if (!message) {
      throw notFound('Message not found');
    }

    if (
      req.user.role !== USER_ROLES.ADMIN &&
      message.senderId !== req.user.id &&
      message.recipientId !== req.user.id
    ) {
      throw forbidden('You do not have access to this message');
    }

    res.json({ message: toDto(message) });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      throw notFound('Message not found');
    }

    if (message.recipientId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
      throw forbidden('Only the recipient can mark the message as read');
    }

    if (!message.readAt) {
      message.readAt = new Date();
      await message.save();
    }

    const reloaded = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'recipient' }
      ]
    });

    res.json({ message: toDto(reloaded) });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      throw notFound('Message not found');
    }

    if (
      req.user.role !== USER_ROLES.ADMIN &&
      message.senderId !== req.user.id &&
      message.recipientId !== req.user.id
    ) {
      throw forbidden('You do not have permission to delete this message');
    }

    await message.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSchema,
  createMessage,
  listMessages,
  getMessage,
  markAsRead,
  deleteMessage
};
