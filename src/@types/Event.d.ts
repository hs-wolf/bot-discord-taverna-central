declare type Event = {
  name: string;
  description: string;
  once: boolean;
  execute: (...args: any[]) => Promise<void>;
};
