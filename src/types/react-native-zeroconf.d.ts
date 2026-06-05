declare module 'react-native-zeroconf' {
  export default class Zeroconf {
    constructor();
    scan(type: string): void;
    stop(): void;
    publishService(
      name: string,
      type: string,
      domain: string,
      port: number,
      txt?: Record<string, string>,
    ): void;
    unpublishService(name: string): void;
    on(event: string, callback: (service: Record<string, unknown>) => void): void;
  }
}
