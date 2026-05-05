export const customNotificationHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6;">
  <tr>
    <td style="padding: 20px 0; border-bottom: 2px solid #0063C6;">
      <h1 style="margin: 0; font-size: 20px; color: #0063C6;">Kurse &amp; Events</h1>
      <p style="margin: 4px 0 0; font-size: 13px; color: #666666;">DCC - Data Competence Center</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 0;">
      <p>Hallo {{givenName}} {{familyName}},</p>
      <p>{{customMessage}}</p>
      {{> courseDetailsHtml}}
      <p>Du kannst den Termin hier einsehen oder dich abmelden:<br>
      <a href="{{siteUrl}}/courses/{{courseId}}/{{sessionId}}" style="color: #0063C6;">{{siteUrl}}/courses/{{courseId}}/{{sessionId}}</a></p>
      {{#if hasIcsAttachment}}
      <p>Im Anhang findest Du die aktualisierte Kalendereinladung.</p>
      {{/if}}
    </td>
  </tr>
  <tr><td>{{> signatureHtml}}</td></tr>
</table>`;

export const customNotificationText = `Hallo {{givenName}} {{familyName}},

{{customMessage}}

{{> courseDetailsText}}

Du kannst den Termin hier einsehen oder dich abmelden:
{{siteUrl}}/courses/{{courseId}}/{{sessionId}}

{{#if hasIcsAttachment}}Im Anhang findest Du die aktualisierte Kalendereinladung.
{{/if}}
{{> signatureText}}`;
