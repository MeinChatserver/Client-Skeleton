export class RoomConfiguration {
  chat_allowed: boolean = false;
  user_join: boolean = false;
  user_leave: boolean = false;
  user_welcome: boolean = false;

  constructor(data: any = null) {
    if (data) {
      this.chat_allowed = data.chat_allowed ?? false;
      this.user_join = data.user_join ?? false;
      this.user_leave = data.user_leave ?? false;
      this.user_welcome = data.user_welcome ?? false;
    }
  }

  isChatAllowed(): boolean {
    return this.chat_allowed;
  }

  isUserJoinNotified(): boolean {
    return this.user_join;
  }

  isUserLeaveNotified(): boolean {
    return this.user_leave;
  }

  isUserWelcomeNotified(): boolean {
    return this.user_welcome;
  }
}
