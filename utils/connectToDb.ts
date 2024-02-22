import prisma from "./prisma";
const connectToDb = async (): Promise<any> => {
  try {
    await prisma.$connect();
  } catch (error: any) {
    console.log(error);
  }
};

export default connectToDb;
