import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_EMAIL_API_KEY);

export const sendAddPostaReportMail = async (attachment: string) => {
  try {
    const msg = {
      to: process.env.NEXT_PUBLIC_TO_EMAIL,
      from: {
        email: process.env.NEXT_PUBLIC_FROM_EMAIL,
        name: 'TioMarkets',
      },
      subject: 'Add Posts via CSV Report',
      text: `
      Hi,

      Report for post upload - ${!attachment ? 'All posts added successfully' : 'Error report attached'}

      Regards,
      Tio Markets
      `,
    };

    if (attachment) {
      msg['attachments'] = [
        {
          content: attachment,
          filename: 'Add-Posts-Report.csv',
          type: 'text/csv',
          disposition: 'attachment',
        },
      ];
    }
  
    await sgMail.send(msg).catch((err) => {
      console.error('Something went wrong while sending report email');
      console.error(err.response.body.errors)
    });
  } catch (error) {
    console.error('Something went wrong while sending report email');
    console.error(error);
  }
}
