'use strict';

const { TOKEN_EXPIRATION_IN_MINUTES, BASE_URL, FROM_EMAIL, PAYPAL_LINK, ACCOUNT } = require("./constants");
const { formatCurrency } = require("./calc");

function getDepartmentFullname(department) {
  return department === "hilbert" ? "Hilbert" :
      department === "munser-kiefer" ? "Munser-Kiefer" : "kein Lehrstuhl (Gast)"
}

exports.registeredMessage = function (email, firstname, lastname, token) {
  const confirmURL = `${BASE_URL}/confirm/${token}`;
  return {
    to: `${email}`,
    from: `${FROM_EMAIL}`,
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

exports.adminMessageAtRegistration = function(adminEmail, firstname, lastname, userEmail, department) {
  return {
    to: `${adminEmail}`,
    from: `${FROM_EMAIL}`,
    subject: `[Info:] Neue Nutzerregistrierung im Cafe Sedanstrasse`,
    text: `
    Ein(e) neue Nutzer*in hat sich in der WebApp "Café Sedanstraße" registriert.
    -------------------------------------
    Name: ${firstname} ${lastname}
    E-Mail: ${userEmail}
    Lehrstuhl: ${getDepartmentFullname(department)}
    -------------------------------------
    `,
    html: `
    <p>Ein(e) neue Nutzer*in hat sich in der WebApp "Café Sedanstraße" registriert.</p>
    <hr>
    <ul>
      <li><strong>Name:</strong> ${firstname} ${lastname}</li>
      <li><strong>E-Mail:</strong> ${userEmail}</li>
      <li><strong>Lehrstuhl:</strong> ${getDepartmentFullname(department)}</li>
    </ul>
    <hr>
    `,
  }
};

exports.passwordResetMessage = function (email, token) {
  const resetUrl = `${BASE_URL}/reset/${token}`;
  return {
    to: `${email}`,
    from: `${FROM_EMAIL}`,
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

exports.receiveBill = function(firstname, email, cupsSinceLastPayment, currentBalanceInCent) {
  return {
    to: `${email}`,
    from: `${FROM_EMAIL}`,
    subject: "Du hast eine neue Kaffee Abrechnung.",
    text: `
    Hallo ${firstname}.
    
    Du hast eine neue Kaffee Abrechnung in Höhe von ${formatCurrency(currentBalanceInCent)} Euro erhalten.
    
    Seit deiner letzten Abrechnung hast du ${cupsSinceLastPayment} Tassen Kaffee getrunken.
    
    Um die Rechnung zu begleichen, zahle per PayPal, indem du folgenden Link in deinen Browser kopierst:
    ---------------------------
    ${PAYPAL_LINK}.
    ---------------------------
    
    Oder überweise den Betrag auf folgendes Konto:
    Konto Inhaber: ${ACCOUNT.accountee}
    IBAN: ${ACCOUNT.IBAN}
    BIC: ${ACCOUNT.BIC}
    `,
    html: `
    <p>Hallo ${firstname}.</p>
    <p>Du hast eine neue Kaffee Abrechnung in Höhe von ${formatCurrency(currentBalanceInCent)} Euro erhalten.</p>
    <p>Seit deiner letzten Abrechnung hast du ${cupsSinceLastPayment} Tassen Kaffee getrunken.</p>
    <p>Um die Rechnung zu begleichen, zahle per <strong>PayPal</strong>, indem du auf folgenden <a href="${PAYPAL_LINK}">Link klickst</a>.</p>
    <p>Oder überweise den Betrag auf folgendes Konto:</p>
    <ul>
      <li>Konto Inhaber: ${ACCOUNT.accountee}</li>
      <li>IBAN: ${ACCOUNT.IBAN}</li>
      <li>BIC: ${ACCOUNT.BIC}</li>
    </ul>
    `
  };
};
