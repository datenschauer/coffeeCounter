'use strict';

const { TOKEN_EXPIRATION_IN_MINUTES, BASE_URL } = require("./constants");

exports.registeredMessage = function (email, firstname, lastname, token) {
  const confirmURL = `${BASE_URL}/confirm/${token}`;
  return {
    to: `${email}`,
    from: "stefan.boehringer@posteo.de",
    subject: "Deine Registrierung im Café Sedanstraße.",
    text: `
    Vielen Dank ${firstname} ${lastname} für deine Registrierung!
    
    Bitte bestätige deine Registrierung, indem du folgenden Link in die Adresszeile
    deines Browsers kopierst und 'Enter' drückst.
    ----------------------------------------------------------------------------
    ${confirmURL}
    ----------------------------------------------------------------------------
    `,
    html: `
    <p>Vielen Dank ${firstname} ${lastname} für deine Registrierung!</p>
    <p>Bitte bestätige deine Registrierung, indem du auf <a href="${confirmURL}">folgenden Link</a> klickst.</p>
    `,
  };
};

exports.passwordResetMessage = function (email, token) {
  const resetUrl = `${BASE_URL}/reset/${token}`;
  return {
    to: `${email}`,
    from: "stefan.boehringer@posteo.de",
    subject: "Zurücksetzen deines Passworts",
    text: `
    Hallo,
    Du hast das Zurücksetzen deines Passworts angefordert.
    
    Dazu kopiere bitte folgenden Link in die Adresszeile
    deines Browsers und drücke Enter:
    -----------------------------------------------------------------
    ${resetUrl}
    -----------------------------------------------------------------
    Der Link läuft in ${TOKEN_EXPIRATION_IN_MINUTES} Minuten ab!
    
    Solltest du die Zurücksetzung deines Passwortes nicht angefordert haben, ignoriere einfach diese E-Mail.
    `,
    html: `
    <p>Hallo,</p>
    <p>Du hast das Zurücksetzen deines Passworts angefordert.</p>
    <p>Dazu klicke bitte auf <a href="${resetUrl}">folgenden Link</a>.</p>
    <p>Der Link läuft in <strong>${TOKEN_EXPIRATION_IN_MINUTES} Minuten</strong> ab.</p>
    <br>
    <p>Solltest du die Zurücksetzung deines Passworts nicht angefordert haben, ignoriere einfach diese E-Mail.</p>
    `,
  };
};
