import {
  ButtonInteraction,
  Message,
  SelectMenuInteraction,
  User
} from 'discord.js';
import { identifiers } from '@components/identifiers';

const { config } = identifiers;

const filterMessage = (user: User) => {
  return async (message: Message) => {
    return message.author.id === user.id;
  };
};
const filterButton = (user: User) => {
  return (i: ButtonInteraction) => {
    i.deferUpdate();
    return i.user.id === user.id;
  };
};
const filterSelectMenu = (user: User) => {
  return (i: SelectMenuInteraction) => {
    i.deferUpdate();
    return i.user.id === user.id;
  };
};
const collectorMessage = (user: User, reply: Message) => {
  return reply.channel.createMessageCollector({
    filter: filterMessage(user),
    time: config.inputTime
  });
};
const collectorButtons = (user: User, reply: Message) => {
  return reply.createMessageComponentCollector({
    filter: filterButton(user),
    componentType: 'BUTTON',
    time: config.inputTime,
    max: 1
  });
};
const collectorSelectMenu = (user: User, reply: Message) => {
  return reply.createMessageComponentCollector({
    filter: filterSelectMenu(user),
    componentType: 'SELECT_MENU',
    time: config.inputTime,
    max: 1
  });
};

export {
  filterMessage,
  filterButton,
  filterSelectMenu,
  collectorMessage,
  collectorButtons,
  collectorSelectMenu
};
