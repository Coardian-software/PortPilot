export interface PortProcess {
  pid: number;
  port: number;
  protocol: 'tcp';
  address: string;
  processName?: string;
  executablePath?: string;
  commandLine?: string;
  user?: string;
}

export interface PlatformAdapter {
  readonly platform: string;
  listListeningProcesses(): Promise<PortProcess[]>;
  findProcessesOnPort(port: number): Promise<PortProcess[]>;
  getProcessDetails(
    pid: number,
  ): Promise<
    Partial<Pick<PortProcess, 'executablePath' | 'commandLine' | 'user'>>
  >;
  terminateProcess(
    pid: number,
    signal: 'SIGTERM' | 'SIGKILL',
  ): Promise<boolean>;
}

export class PlatformCapabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformCapabilityError';
  }
}
