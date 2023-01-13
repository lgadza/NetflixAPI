import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (recipientAddress) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Hello first email sent!",
    text: "Louis kurisei",
    html: "<strong>Louis Kurisei ewhjebwekjhmwe</strong>",
  };
  console.log(msg);
  await sgMail.send(msg);
};
