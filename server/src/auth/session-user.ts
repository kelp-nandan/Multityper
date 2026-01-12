export class SessionUser {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public azureOid?: string,
    public uti?: string,
  ) {}

  toJSON(): { id: number; email: string; name: string; azureOid?: string } {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      azureOid: this.azureOid,
    };
  }

  isAzureUser(): boolean {
    return !!this.azureOid;
  }
}
