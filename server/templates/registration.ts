import {
    courseDetailsHtml,
    courseDetailsText,
    signatureHtml,
    signatureText,
} from "./partials/course-details";

export { courseDetailsHtml, courseDetailsText, signatureHtml, signatureText };

export const registrationHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6;">
  <tr>
    <td style="padding: 20px 0; border-bottom: 2px solid #0063C6;">
      <h1 style="margin: 0; font-size: 20px; color: #0063C6;">Kurse &amp; Events</h1>
      <p style="margin: 4px 0 0; font-size: 13px; color: #666666;">DCC - Data Competence Center</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 0;">
      <p>Hallo {{givenName}} {{familyName}},</p>
      <p>Vielen Dank f&uuml;r Deine Anmeldung zum {{courseTypeLabel}} &laquo;{{courseTitle}}&raquo;.</p>
      {{> courseDetailsHtml}}
      <p>Du kannst an dem Termin doch nicht teilnehmen oder hast dich irrt&uuml;mlicherweise angemeldet? &Uuml;ber diesen Link kannst du dich wieder vom Event abmelden:<br>
      <a href="{{siteUrl}}/courses/{{courseId}}/{{sessionId}}" style="color: #0063C6;">{{siteUrl}}/courses/{{courseId}}/{{sessionId}}</a></p>
      {{#if hasIcsAttachment}}
      <p>Im Anhang findest Du eine Kalendereinladung.</p>
      {{/if}}
      <p>Wir freuen uns auf Deine Teilnahme!</p>
    </td>
  </tr>
  <tr><td>{{> signatureHtml}}</td></tr>
</table>`;

export const registrationText = `Hallo {{givenName}} {{familyName}},

Vielen Dank für Deine Anmeldung zum {{courseTypeLabel}} "{{courseTitle}}".

{{> courseDetailsText}}

Du kannst an dem Termin doch nicht teilnehmen oder hast dich irrtümlicherweise angemeldet? Über diesen Link kannst du dich wieder vom Event abmelden:
{{siteUrl}}/courses/{{courseId}}/{{sessionId}}

{{#if hasIcsAttachment}}Im Anhang findest Du eine Kalendereinladung.
{{/if}}
Wir freuen uns auf Deine Teilnahme!

{{> signatureText}}`;
