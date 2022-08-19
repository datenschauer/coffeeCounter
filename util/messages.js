const { TOKEN_EXPIRATION_IN_MINUTES } = require("./constants");

exports.registeredMessage = function (email, firstname, lastname) {
  return {
    to: `${email}`,
    from: "stefan.boehringer@posteo.de",
    subject: "Ihre Registrierung im Café Sedanstraße.",
    text: `Vielen Dank ${firstname} ${lastname} für Ihre Registrierung!`,
    html: `Vielen Dank ${firstname} ${lastname} für Ihre Registrierung!`,
  };
};

exports.passwordResetMessage = function (email, token) {
  const resetUrl = `http://localhost:8000/reset/${token}`;
  return {
    to: `${email}`,
    from: "stefan.boehringer@posteo.de",
    subject: "Zurücksetzen Ihres Passworts",
    text: `
    Hallo,
    Sie haben das Zurücksetzen Ihres Passworts angefordert.
    
    Dazu kopieren Sie bitte folgenden Link in die Adresszeile
    Ihres Browsers und drücken Enter:
    -----------------------------------------------------------------
    ${resetUrl}
    -----------------------------------------------------------------
    Der Link läuft in ${TOKEN_EXPIRATION_IN_MINUTES} Minuten ab!
    
    Sollten Sie die Zurücksetzung Ihres Passwortes nicht angefordert haben, ignorieren Sie einfach diese E-Mail.
    `,
    html: `
    <p>Hallo,</p>
    <p>Sie haben das Zurücksetzen Ihres Passworts angefordert.</p>
    <p>Dazu klicken Sie bitte auf <a href="${resetUrl}">folgenden Link</a>.</p>
    <p>Der Link läuft in <strong>${TOKEN_EXPIRATION_IN_MINUTES} Minuten</strong> ab.</p>
    <br>
    <p>Sollten Sie die Zurücksetzung Ihres Passworts nicht angefordert haben, ignorieren Sie einfach diese E-Mail.</p>
    `,
  };
};
