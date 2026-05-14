import EventEmitter from 'node:events';

class AppEventEmitter extends EventEmitter {}

const eventEmitter = new AppEventEmitter();

eventEmitter.setMaxListeners(20);

export default eventEmitter;
