export interface Profile {
  id: string;
  bio: string;
  profilePicture: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  tasks: [];
  profile: Profile;
}
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
