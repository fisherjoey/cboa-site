// Users who have already signed up (from the user's list)
const signedUpEmails = [
  'turboaa@hotmail.com',
  'ada.calgarynw@gmail.com',
  'anert_dela_paz@yahoo.com',
  'artemartzhura@gmail.com',
  'benarangorin12@gmail.com',
  'diji.blessing@gmail.com',
  'brianstarr.bball@gmail.com',
  'carolyn.kosterman@gmail.com',
  'chacenielson@gmail.com',
  'christopuschak@shaw.ca',
  'cda.bball@gmail.com',
  'par@telus.net',
  'davidefalkenberg@gmail.com',
  'davewebb77@hotmail.com',
  'delaineylh@gmail.com',
  'deng.acuil@gmail.com',
  'paquito_bida14@icloud.com',
  'milliquets@gmail.com',
  'dirkvanderstam@gmail.com',
  'elrenfederipe@gmail.com',
  'ethan.nickerson@outlook.com',
  'epicton@hotmail.com',
  'fblegaspi_2005@yahoo.com.sg',
  'toews.gerry@gmail.com',
  'gabbott100@gmail.com',
  'granthoe@gmail.com',
  'hlclemen@gmail.com',
  'hkch0507@gmail.com',
  'backspace001@naver.com',
  'ianrcrosby09@gmail.com',
  'rbt.ian.pollard@gmail.com',
  'jakesteinbrenner57@gmail.com',
  'info@jasonbarlowrmt.com',
  'jeg701@gmail.com',
  'jeffrey_escuadra@yahoo.com',
  'jfbyam@gmail.com',
  'joannawiegers@gmail.com',
  'fisherjoey@ymail.com',
  'jmackr@gmail.com',
  'justinjweir@gmail.com',
  'coachkarlamd@gmail.com',
  'kassem@elrafih.com',
  'klemieux32@yahoo.com',
  'refkiansy@gmail.com',
  'kirkmmorrison1@outlook.com',
  'kslbwalya@gmail.com',
  '1212lemieux@gmail.com',
  'lpatterson66@hotmail.com',
  'lplungys@yahoo.com',
  'luckyalainbattulayan@yahoo.com',
  'malcolm.mcsween@gmail.com',
  'ronmhars@yahoo.com',
  'matthewbatey1@gmail.com',
  'haackematthew92@gmail.com',
  'lyndacarter88@gmail.com',
  'mhidalgo_18@yahoo.ca',
  'milesphughes@gmail.com',
  'n5879984513@gmail.com',
  'sobhi.osama97@gmail.com',
  'apcdeguzman2@gmail.com',
  'peterwagener2@gmail.com',
  'mortson_reid@hotmail.com',
  'robmkadlec@gmail.com',
  'sam.kurian2322@gmail.com',
  'sean.kingston2011@live.com',
  'tallseanlandry@gmail.com',
  'shanda.tansowny@gmail.com',
  'shanedross03@gmail.com',
  'sohail.tabassum9@gmail.com',
  'sophiafaminoff@telus.net',
  'stafford.g1@gmail.com',
  'stazarapov@gmail.com',
  'steven.fraser000@gmail.com',
  'lawtin@gmail.com',
  'muheebak@yahoo.co.uk',
  'yongpeter.feng@gmail.com',
  'yuzhoulin43@gmail.com'
].map(e => e.toLowerCase());

// Full member list
const allMembers = require('./members-to-migrate.json');

// Find members who haven't signed up
const needsEmail = allMembers.filter(member =>
  !signedUpEmails.includes(member.email.toLowerCase())
);

console.log(`Total members: ${allMembers.length}`);
console.log(`Already signed up: ${signedUpEmails.length}`);
console.log(`Need welcome emails: ${needsEmail.length}`);
console.log('\n--- Members needing welcome emails ---\n');

needsEmail.forEach(m => console.log(`${m.name}: ${m.email}`));

// Save to JSON
const fs = require('fs');
fs.writeFileSync('./scripts/users-needing-emails.json', JSON.stringify(needsEmail, null, 2));
console.log('\nSaved to scripts/users-needing-emails.json');
