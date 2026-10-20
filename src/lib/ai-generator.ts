import { 
  RelationshipType, 
  ToneType, 
  LanguageType,
  GenderPronoun 
} from "./proposal-types";

export interface GenerateProposalParams {
  yourName: string;
  partnerName: string;
  relationshipType?: RelationshipType;
  tone: ToneType;
  language: LanguageType;
  yourPronouns?: GenderPronoun;
  partnerPronouns?: GenderPronoun;
}

interface TemplateContext {
  yourName: string;
  partnerName: string;
  yourPronouns: GenderPronoun;
  partnerPronouns: GenderPronoun;
  relationshipType?: RelationshipType;
}

function getGrammar(ctx: TemplateContext) {
  const isFemaleSender = ctx.yourPronouns === "she/her";
  const isMaleSender = ctx.yourPronouns === "he/him";

  const isMalePartner =
    ctx.partnerPronouns === "he/him" ||
    (!ctx.partnerPronouns &&
      (ctx.relationshipType === "boyfriend" || ctx.relationshipType === "husband"));
  const isFemalePartner =
    ctx.partnerPronouns === "she/her" ||
    (!ctx.partnerPronouns &&
      ctx.relationshipType !== "boyfriend" &&
      ctx.relationshipType !== "husband");

  return {
    isFemaleSender,
    isMaleSender,
    isFemalePartner,
    isMalePartner,
    // Sender verb inflections (Hindi/Hinglish)
    senderKarta: isFemaleSender ? "karti hoon" : "karta hoon",
    senderRakhunga: isFemaleSender ? "khush rakhungi" : "khush rakhunga",
    senderTumhara: isFemaleSender ? "Tumhari" : "Tumhara",
    senderMila: isFemaleSender ? "mili hoon" : "mila hoon",
    senderMilaPast: isFemaleSender ? "mili main" : "mila main",
    senderRehSakta: isFemaleSender ? "reh sakti" : "reh sakta",
    senderThaamna: isFemaleSender ? "thaamna chahti hoon" : "thaamna chahta hoon",
    senderChahta: isFemaleSender ? "chahti hoon" : "chahta hoon",
    senderDhoondh: isFemaleSender ? "dhoondh rahi thi" : "dhoondh raha tha",
    senderBanunga: isFemaleSender ? "banungi" : "banunga",
    senderBhool: isFemaleSender ? "Bhool jaati hoon" : "Bhool jaata hoon",
    senderDoonga: isFemaleSender ? "doongi" : "doonga",
    senderFeel: isFemaleSender ? "feel karti hoon" : "feel karta hoon",
    senderDeta: isFemaleSender ? "wajood deti hoon" : "wajood deta hoon",

    // Partner address inflections (Hindi/Hinglish & English)
    partnerCute: isFemalePartner ? "kitni" : "kitne",
    partnerRahoge: isFemalePartner ? "rahogi?" : "rahoge?",
    partnerWoThi: isFemalePartner ? "wo tum thi" : "wo tum the",
    partnerHero: isFemalePartner ? "heroine" : isMalePartner ? "hero" : "superstar",
    partnerHasaati: isFemalePartner ? "hasaati ho" : "hasaate ho",
    partnerSunLeti: isFemalePartner ? "sun leti ho" : "sun lete ho",
    partnerSamajhti: isFemalePartner ? "samajhti ho" : "samajhte ho",
    partnerMeriBanJao: isFemalePartner ? "officially meri ban jao" : "officially mere ban jao",
    partnerJaanti: isFemalePartner ? "jaanti ho" : "jaante ho",
    partnerBanogi: isFemalePartner ? "banogi?" : "banoge?",
    partnerGayi: isFemalePartner ? "ban gayi ho" : "ban gaye ho",
    partnerMisra: isFemalePartner ? "sabse haseen misra hoti" : "sabse haseen misra hote",
  };
}

type TemplateFn = (ctx: TemplateContext) => string;

interface LocalizedTemplates {
  english: TemplateFn;
  hinglish: TemplateFn;
}

const toneStyles: Record<ToneType, LocalizedTemplates[]> = {
  cute: [
    {
      english: (ctx) =>
        `${ctx.partnerName}, from the moment I met you, my heart knew it had found its home. Every smile you share, every laugh we have together, makes my world brighter. You are my sunshine on cloudy days, my peace in chaos. I promise to cherish every moment with you, to make you smile every day, and to love you endlessly. Will you be mine forever? With all my heart, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, jab se tumse ${g.senderMila}, meri duniya badal gayi hai. Tumhari har muskaan mera din bana deti hai. Tum meri zindagi ki sabse pyaari cheez ho. Main promise ${g.senderKarta} ki tumhe hamesha ${g.senderRakhunga}. Tum meri life ka sabse special part ho. Forever ${g.senderTumhara.toLowerCase()}, ${ctx.yourName}.`;
      },
    },
    {
      english: (ctx) =>
        `Hey ${ctx.partnerName}, you know what? You are the cutest person in my universe. Your smile is my favorite sight, and your voice is my favorite sound. I cannot imagine a single day without you. You complete me in ways I never knew possible. Be mine, always? Love you to the moon and back, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, tumhe pata hai tum ${g.partnerCute} cute ho? Tumhari smile dekhke mera dil khush ho jaata hai. Tum mere liye duniya ki sabse special ho. Main tumhare bina ek din bhi nahi ${g.senderRehSakta}. Forever together? Bahut saara pyaar, ${ctx.yourName}.`;
      },
    },
  ],
  emotional: [
    {
      english: (ctx) =>
        `My dearest ${ctx.partnerName}, words feel inadequate to express what you mean to me. You came into my life and painted it with colors I never knew existed. Every moment with you is a treasure I hold close to my heart. Through every storm and sunshine, I want to walk beside you. You are my greatest blessing, my deepest love. Will you let me love you forever? Eternally yours, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, kuch lafzon mein kaise bataaun ki tum mere liye kya ho? Tum meri zindagi mein aaye aur sab kuch badal diya. Har pal tumhare saath guzara ek khubsurat yaad ban jaata hai. Zindagi ke har mod pe main tumhara haath ${g.senderThaamna}. Tum meri sabse badi khushi ho. Hamesha mere saath ${g.partnerRahoge} ${g.senderTumhara}, ${ctx.yourName}.`;
      },
    },
    {
      english: (ctx) =>
        `${ctx.partnerName}, in the story of my life, you are the most beautiful chapter. Before you, I was searching for something I could not name. Now I know - it was you. Your love has healed parts of me I did not know were broken. I want to spend every sunrise and sunset with you, every ordinary moment made extraordinary by your presence. My heart is yours, completely and forever. With all my love, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, meri zindagi ki kahani mein tum sabse sundar chapter ho. Tumse pehle main kuch ${g.senderDhoondh} jo samajh nahi aa raha tha. Ab pata chala - ${g.partnerWoThi}. Tumhari mohabbat ne mujhe complete kar diya. Main har subah aur har shaam tumhare saath bitaana ${g.senderChahta}. Mera dil sirf tumhara hai. Bahut pyaar, ${ctx.yourName}.`;
      },
    },
  ],
  filmy: [
    {
      english: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, like every great love story, ours was written in the stars. From the first moment I saw you, I knew you were the one my heart had been waiting for. You are the ${g.partnerHero} of my life's movie, and I want you to be in every scene, every frame. Our love story deserves a grand finale - will you make this a happily ever after? Your co-star forever, ${ctx.yourName}.`;
      },
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, hamari love story kismet mein likhi thi. Pehli nazar mein hi dil keh raha tha - yahi hai! Tum meri life ki film ki ${g.partnerHero} ho. Har scene mein tum chahiye, har frame mein tum. Kya tum mere saath ye love story complete karoge? Happy ending ke liye haan bolo? ${g.senderTumhara} forever, ${ctx.yourName}.`;
      },
    },
    {
      english: (ctx) => {
        const g = getGrammar(ctx);
        const heroRomance = g.isMalePartner ? "Shah Rukh Khan romance" : "fairytale romance";
        return `${ctx.partnerName}, they say true love happens only in movies, but then I found you. Our story is more beautiful than any Bollywood script. You are my ${heroRomance}, my epic love saga. Every moment with you feels like a movie scene I never want to end. Will you be the love of my life, my eternal co-star? Ek ladka aur ek ladki... you know the rest! Forever yours, ${ctx.yourName}.`;
      },
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, kehte hain sachcha pyaar sirf films mein hota hai, phir tumse ${g.senderMilaPast}. Hamari kahani Bollywood se bhi zyada filmy hai! Tum meri zindagi ki sabse badi blockbuster ho. Har lamha tumhare saath ek beautiful scene hai. Picture abhi baaki hai mere dost - will you be mine? Rehna hai tere dil mein, hamesha. Love you, ${ctx.yourName}.`;
      },
    },
  ],
  funny: [
    {
      english: (ctx) =>
        `Dear ${ctx.partnerName}, I have thought about this very seriously, and I have come to a conclusion: you are stuck with me. Sorry, no refunds! You make me laugh like no one else, you tolerate my terrible jokes, and you still find me cute somehow. I promise to be your personal comedian, your snack partner, and your biggest fan. So, will you officially accept this chaos into your life? Yours (whether you like it or not), ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, maine bahut socha aur decide kiya - tum ab mere saath stuck ho. Return policy nahi hai! Tum mujhe ${g.partnerHasaati} jaise koi nahi, meri bakwas jokes bhi ${g.partnerSunLeti}, aur phir bhi mujhe cute ${g.partnerSamajhti}. Main promise ${g.senderKarta} tumhara personal joker ${g.senderBanunga}, snacks partner bhi. So, ${g.partnerMeriBanJao}? ${g.senderTumhara}, chahe mano ya na mano, ${ctx.yourName}.`;
      },
    },
    {
      english: (ctx) =>
        `${ctx.partnerName}, let us be honest - I am not perfect. I forget things, I am sometimes lazy, and my cooking is questionable. But you know what? I love you more than pizza, and that is saying something! You are my favorite notification, my most-used emoji, and the only person I would share my fries with. Will you be my partner in crime and in life? Warning: this offer comes with unlimited hugs! Love, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, honestly - main perfect nahi hoon. ${g.senderBhool}, lazy hoon, aur mera cooking toh... questionable hai. But tum ${g.partnerJaanti}? Main tumse pizza se bhi zyada pyaar ${g.senderKarta}, aur ye bada deal hai! Tum meri favorite notification ho, sabse zyada use kiya emoji ho. Apne fries bhi sirf tumhe ${g.senderDoonga}. Partner in crime ${g.partnerBanogi} Warning: unlimited hugs milenge! Pyaar se, ${ctx.yourName}.`;
      },
    },
  ],
  "deep-romantic": [
    {
      english: (ctx) =>
        `${ctx.partnerName}, in the vast universe of countless souls, finding you feels like destiny breathing life into my existence. You are not just someone I love - you are the very essence of why I believe in love. Every heartbeat whispers your name, every dream paints your face. I do not just want to love you for a lifetime; I want to love you beyond time itself. Will you let our souls dance together through eternity? Forever bound to you, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, iss badi duniya mein tumhe paana kismet ka sabse bada tohfa hai. Tum sirf pyaar nahi, tum pyaar ki wajah ho. Meri har dhadkan tumhara naam leti hai, har khwaab mein tumhara chehra hai. Main tumhe sirf is janam mein nahi, har janam mein ${g.senderChahta}. Hamari roohein hamesha saath rahein? ${g.senderTumhara} hamesha ke liye, ${ctx.yourName}.`;
      },
    },
    {
      english: (ctx) =>
        `${ctx.partnerName}, they say love is just a feeling, but what I feel for you transcends every definition. You have become the air I breathe, the light I see, the hope I hold. In your eyes, I found a home my soul had been searching for across lifetimes. I offer you not just my heart, but my entire being. Will you accept this love that knows no bounds, no end, no conditions? In this life and every life after, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, log kehte hain pyaar ek ehsaas hai, par tumhare liye jo main ${g.senderFeel} wo us se bahut zyada hai. Tum meri saans ${g.partnerGayi}, meri roshni, meri umeed. Tumhari aankhon mein maine wo ghar dhoondh liya jo meri rooh kayi janmon se dhoondh rahi thi. Main tumhe sirf dil nahi, apna poora ${g.senderDeta}. Ye behadh pyaar accept karoge? Is janam aur har janam mein, ${ctx.yourName}.`;
      },
    },
  ],
  "poetic-vip": [
    {
      english: (ctx) =>
        `${ctx.partnerName}, if love were written in poetry across the celestial sphere, your name would be its sweetest refrain. Every moment beside you feels consecrated with beauty, grace, and eternity. You are my greatest inspiration and my forever home. Will you walk hand-in-hand with me into infinity? With devotion that defies time, ${ctx.yourName}.`,
      hinglish: (ctx) => {
        const g = getGrammar(ctx);
        return `${ctx.partnerName}, agar mohabbat koi shero-shayari hoti, toh tum uska ${g.partnerMisra}. Tumhare saath har lamha ek khwaab jaisa lagta hai jo sach ho gaya ho. Meri zindagi ki har subah aur har shaam sirf tumhare naam hai. Hamesha ke liye mere banoge? Poori rooh se ${g.senderTumhara.toLowerCase()}, ${ctx.yourName}.`;
      },
    },
  ],
};

export function generateProposalMessage(params: GenerateProposalParams): string {
  const {
    yourName,
    partnerName,
    tone,
    language,
    yourPronouns = "he/him",
    partnerPronouns = "she/her",
    relationshipType,
  } = params;

  const templates = toneStyles[tone] || toneStyles["deep-romantic"];
  const randomIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomIndex];

  const ctx: TemplateContext = {
    yourName: yourName.trim() || "Me",
    partnerName: partnerName.trim() || "My Love",
    yourPronouns,
    partnerPronouns,
    relationshipType,
  };

  const builder =
    language === "hinglish" ? template.hinglish : template.english;
  let message = builder(ctx);

  // Strict Privacy & Safety: Never leak technical pronoun tokens into romantic prose
  message = message
    .replace(/\b(he\/him|she\/her|they\/them)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return message;
}
