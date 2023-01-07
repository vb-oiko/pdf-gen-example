import path from "path";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { LockService } from "../cron/ReportGenerationCron";

export class LocalLockService implements LockService {
  private pathname: string;
  private readonly filename = ".cron.lock";
  private readonly timeoutMs = 10_000;

  constructor() {
    this.pathname = path.resolve(this.filename);
  }

  public acquireLock() {
    if (this.isLocked()) {
      throw new Error(
        "Can't acquire a lock. Lock already exists and is not expired"
      );
    }

    this.writeLock();
  }

  public releaseLock() {
    unlinkSync(this.pathname);
  }

  public isLocked(): boolean {
    const lock = this.readLock();
    if (!lock) {
      return false;
    }

    const now = Date.now();
    const lockLifespan = now - lock;

    if (lockLifespan < this.timeoutMs) {
      return true;
    }

    return false;
  }

  writeLock() {
    const now = Date.now();
    writeFileSync(this.pathname, now.toString(), { encoding: "utf-8" });
  }

  readLock() {
    try {
      const content = readFileSync(this.pathname, {
        encoding: "utf-8",
      });

      const timestamp = Number(content);

      return timestamp;
    } catch (err) {
      return null;
    }
  }
}
