# Inngangur

Ég er mikill Warhammer 40.000 spilari, og mér hefur alltaf þótt gaman
af því að hafa smá sögu í hernum mínum.  Ég á það til að gefa módelum
nöfn og bæta við skreytingum/orðum á módel sem gera eitthvað merkilegt
í bardögum.  Því lá beint við með svona opið verkefni að gera eitthvað
sem ég hef verið að hugsa um lengi og búa til kerfi til þess að halda
utan um þessa hluti.

Kerfið er vefþjónusta sem gerir þér kleift að halda utan um módelin
þín, hvaða vopn þau bera, hvaða sveitum þau tilheyra, hvaða heiðra
(e. battle honours) þau hafa unnið til, og hvaða bardaga þú hefur
barist.

# Uppfylt skilyrði

Verkefnið uppfyllir eftirfarandi skilyrði:
- Notendaumsjón (Hægt er að nýskrá notendur, og skrá sig inn)
- Vefþjónusta (Sá hluti verkefnisins sem er sýnilegur notendum er
  vefþjónusta)
- Gagnagrunnur (Vefþjónustan nýtir gagnagrunn til þess að vista gögnin
  sem notendur senda inn)
  
# Útfærlsa

Á heildina litið gekk útfærslan bara mjög vel.  Það tók ~2 daga að
forrita og þar hjálpaði mikið að ég hafði byrjað á hönnunarvinnu
töluvert áður en ég byrjaði að forrita.  Ég gat líka endurnýtt suma
hluti úr eldri verkefnum (þar er helst að nefna notendaumsjónina og
aðferðina mína við endapunkta skilgreiningu).

Ef eitthvað gekk illa þá var það að vinna með `express-validator`, sem
virðist af einhverjum ástæðum ekki vinna vel saman með TypeScript
þegar þú notar `custom` validator-inn.  Eins bara almenn type
vandamál, því meira sem ég nota TypeScript því sannfærðari verð ég um
að það sé einfaldlega ekki nógu gott.  Ég er nokkuð viss um það að
bókstaflega hvert einasta vandamál sem ég lenti í hafi stafað af
`undefined` gildi eða type villu sem TypeScript greip ekki.

# Framtíðin

Það kæmi mér lýtið á óvart ef ég gerði eitthvað meira með þessa
hugmynd.  Sérstaklega ef ég fer að finna mér tímann til þess að spila
Warhammer að einhverju ráðu aftur.  Hinsvegar finnst mér töluvert
ólíklegt að neitt af þessu verkefni myndi nýtast í þeirri vinnu sem
neitt meira en uppkast sem hægt er að sækja hugmyndir í.

Eins og áður segir hef ég ekkert svakalega hátt álit á TypeScript eins
og er og því myndi ég að lágmarki vilja endurskrifa allt heila klabbið
í máli sem ég treysti betur til þess að framleyða áreiðanlegan
hugbúnað.  Að sama skapi sé ég ekki mikin tilgang í því að hafa þetta
sem vefþjónustu.  Ég stefni ekki á að hýsa þetta þannig að aðrir geti
notað það, stuðningur fyrir marga notendur margfaldar flækjustigið á
útfærslu flestra hluta kerfisins, og ég er almennt ekki hrifinn af því
að nýta vefþjónustur í hluti sem er auðveldlega hægt að gera á vélinni
minni (sjá:
https://www.gnu.org/philosophy/keep-control-of-your-computing.html,
https://www.gnu.org/philosophy/who-does-that-server-really-serve.html).
