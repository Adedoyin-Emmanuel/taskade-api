import transporter from "./mail.config";

export const sendResetPasswordEmail = (
  subject: string,
  toEmail: string,
  name: string,
  otp: string
) => {
  const emailContent = ` <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1>Appointment Approved</h1>
      
                    <p >Dear ${name},</p>
      
                We received a request to reset your password for your account. Use the One Time Pin below to reset your password.

                <p>One Time Pin: ${otp} </p>
                  

                    <p >Thank you for choosing Caresync.</p>
                </div>`;
};
