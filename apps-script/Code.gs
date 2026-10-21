/**
 * Wallflower · Brand Discovery Journey — response collector.
 *
 * Paste this into the Google Sheet's Extensions → Apps Script editor,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 *
 * Each founder's journey is one row, keyed by its Response ID.
 * The page re-sends the whole row as they go, so the row is updated in place
 * (not duplicated) and you can watch answers arrive live.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || !data.id || !data.headers || !data.row) return reply_({ ok: false, error: 'bad request' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Header row: keep what's there, add any new question columns on the right.
    var lastCol = sheet.getLastColumn();
    var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
    header = header.filter(function (h) { return h !== ''; });
    data.headers.forEach(function (h) { if (header.indexOf(String(h)) === -1) header.push(String(h)); });
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Line the incoming answers up with the header columns.
    var incoming = {};
    data.headers.forEach(function (h, i) { incoming[String(h)] = data.row[i]; });
    var values = header.map(function (h) { return safe_(incoming.hasOwnProperty(h) ? incoming[h] : ''); });

    // Update this journey's row if it exists, otherwise add a new one.
    var idCol = header.indexOf('Response ID') + 1;
    var target = 0;
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
      for (var r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === String(data.id)) { target = r + 2; break; }
      }
    }
    if (!target) target = lastRow + 1;

    var range = sheet.getRange(target, 1, 1, values.length);
    range.setNumberFormat('@');           // keep answers as plain text (no surprise dates)
    range.setValues([values]);
    range.setWrap(true).setVerticalAlignment('top');
    return reply_({ ok: true, row: target });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('The Wallflower response collector is running.');
}

// Stop answers that start with = + - @ being read as spreadsheet formulas.
function safe_(v) {
  var s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
