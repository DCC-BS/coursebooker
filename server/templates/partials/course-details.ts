export const courseDetailsHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-radius: 8px; margin: 16px 0;">
  <tr>
    <td style="padding: 16px;">
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #0063C6;">{{courseTypeLabel}}details</h3>
      <table cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.8;">
        <tr>
          <td style="color: #666666; width: 80px; vertical-align: top;">Name:</td>
          <td style="color: #333333;">{{courseTitle}}</td>
        </tr>
        {{#if isSingleLesson}}
        <tr>
          <td style="color: #666666; vertical-align: top;">Datum:</td>
          <td style="color: #333333;">{{dateStr}}</td>
        </tr>
        <tr>
          <td style="color: #666666; vertical-align: top;">Uhrzeit:</td>
          <td style="color: #333333;">{{timeStr}}</td>
        </tr>
        {{else}}
        <tr>
          <td style="color: #666666; vertical-align: top;">Termine:</td>
          <td style="color: #333333; white-space: pre-line;">{{dateStr}}</td>
        </tr>
        {{/if}}
        <tr>
          <td style="color: #666666; vertical-align: top;">Ort:</td>
          <td style="color: #333333;">{{location}}</td>
        </tr>
        {{#if teamsLink}}
        <tr>
          <td style="color: #666666; vertical-align: top;">MS Teams:</td>
          <td><a href="{{teamsLink}}" style="color: #0063C6;">{{teamsLink}}</a></td>
        </tr>
        {{/if}}
      </table>
    </td>
  </tr>
</table>`;

export const courseDetailsText = `{{courseTypeLabel}}details:
- Name: {{courseTitle}}
{{#if isSingleLesson}}
- Datum: {{dateStr}}
- Uhrzeit: {{timeStr}}
{{else}}
- Daten:
{{dateStr}}
{{/if}}
- Ort: {{location}}
{{#if teamsLink}}- MS Teams Link: {{teamsLink}}{{/if}}`;

export const signatureHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6;">
  <tr>
    <td style="padding: 16px 0; border-top: 1px solid #E5E7EB; font-size: 13px; color: #888888;">
      <p style="margin: 0;">Liebe Gr&uuml;sse,<br><strong>{{organizerName}}</strong><br>
      <a href="mailto:{{organizerMail}}" style="color: #0063C6;">{{organizerMail}}</a></p>
    </td>
  </tr>
</table>`;

export const signatureText = `Liebe Grüsse,
{{organizerName}}
{{organizerMail}}`;
