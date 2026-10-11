import { 
  RelationshipType, 
  ToneType, 
  LanguageType 
} from "./proposal-types";

interface GenerateProposalParams {
  yourName: string;
  partnerName: string;
  relationshipType: RelationshipType;
  tone: ToneType;
  language: LanguageType;
}

type LocalizedTemplates = {
  english: string;
  hinglish: string;
  spanish?: string;
  french?: string;
  hindi?: string;
};

const toneStyles: Record<ToneType, LocalizedTemplates[]> = {
  cute: [
    {
      english: `${"{partnerName}"}, from the moment I met you, my heart knew it had found its home. Every smile you share, every laugh we have together, makes my world brighter. You are my sunshine on cloudy days, my peace in chaos. I promise to cherish every moment with you, to make you smile every day, and to love you endlessly. Will you be mine forever? With all my heart, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, jab se tumse mili hoon, meri duniya badal gayi hai. Tumhari har muskaan mera din bana deti hai. Tum meri zindagi ki sabse pyaari cheez ho. Main promise karti/karta hoon ki tumhe hamesha khush rakhunga/rakhungi. Tum meri life ka sabse special part ho. Forever tumhari, ${"{yourName}"}.`
    },
    {
      english: `Hey ${"{partnerName}"}, you know what? You are the cutest person in my universe. Your smile is my favorite sight, and your voice is my favorite sound. I cannot imagine a single day without you. You complete me in ways I never knew possible. Be mine, always? Love you to the moon and back, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, tumhe pata hai tum kitni/kitne cute ho? Tumhari smile dekhke mera dil khush ho jaata hai. Tum mere liye duniya ki sabse special ho. Main tumhare bina ek din bhi nahi reh sakti/sakta. Forever together? Bahut saara pyaar, ${"{yourName}"}.`
    }
  ],
  emotional: [
    {
      english: `My dearest ${"{partnerName}"}, words feel inadequate to express what you mean to me. You came into my life and painted it with colors I never knew existed. Every moment with you is a treasure I hold close to my heart. Through every storm and sunshine, I want to walk beside you. You are my greatest blessing, my deepest love. Will you let me love you forever? Eternally yours, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, kuch lafzon mein kaise bataaun ki tum mere liye kya ho? Tum meri zindagi mein aaye aur sab kuch badal diya. Har pal tumhare saath guzara ek khubsurat yaad ban jaata hai. Zindagi ke har mod pe main tumhara haath thaamna chahti/chahta hoon. Tum meri sabse badi khushi ho. Hamesha mere saath rahoge? Tumhara/Tumhari, ${"{yourName}"}.`
    },
    {
      english: `${"{partnerName}"}, in the story of my life, you are the most beautiful chapter. Before you, I was searching for something I could not name. Now I know - it was you. Your love has healed parts of me I did not know were broken. I want to spend every sunrise and sunset with you, every ordinary moment made extraordinary by your presence. My heart is yours, completely and forever. With all my love, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, meri zindagi ki kahani mein tum sabse sundar chapter ho. Tumse pehle main kuch dhoondh raha/rahi thi jo samajh nahi aa raha tha. Ab pata chala - wo tum thi/the. Tumhari mohabbat ne mujhe complete kar diya. Main har subah aur har shaam tumhare saath bitaana chahti/chahta hoon. Mera dil sirf tumhara hai. Bahut pyaar, ${"{yourName}"}.`
    }
  ],
  filmy: [
    {
      english: `${"{partnerName}"}, like every great love story, ours was written in the stars. From the first moment I saw you, I knew you were the one my heart had been waiting for. You are the hero/heroine of my life's movie, and I want you to be in every scene, every frame. Our love story deserves a grand finale - will you make this a happily ever after? Your co-star forever, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, hamari love story kismet mein likhi thi. Pehli nazar mein hi dil keh raha tha - yahi hai! Tum meri life ki film ki hero/heroine ho. Har scene mein tum chahiye, har frame mein tum. Kya tum mere saath ye love story complete karoge? Happy ending ke liye haan bolo? Tumhara forever, ${"{yourName}"}.`
    },
    {
      english: `${"{partnerName}"}, they say true love happens only in movies, but then I found you. Our story is more beautiful than any Bollywood script. You are my Shah Rukh Khan romance, my epic love saga. Every moment with you feels like a movie scene I never want to end. Will you be the love of my life, my eternal co-star? Ek ladka aur ek ladki... you know the rest! Forever yours, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, kehte hain sachcha pyaar sirf films mein hota hai, phir tumse mili/mila main. Hamari kahani Bollywood se bhi zyada filmy hai! Tum meri zindagi ki sabse badi blockbuster ho. Har lamha tumhare saath ek beautiful scene hai. Picture abhi baaki hai mere dost - will you be mine? Rahna hai tere dil mein, hamesha. Love you, ${"{yourName}"}.`
    }
  ],
  funny: [
    {
      english: `Dear ${"{partnerName}"}, I have thought about this very seriously, and I have come to a conclusion: you are stuck with me. Sorry, no refunds! You make me laugh like no one else, you tolerate my terrible jokes, and you still find me cute somehow. I promise to be your personal comedian, your snack partner, and your biggest fan. So, will you officially accept this chaos into your life? Yours (whether you like it or not), ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, maine bahut socha aur decide kiya - tum ab mere saath stuck ho. Return policy nahi hai! Tum mujhe hasaati/hasaate ho jaise koi nahi, meri bakwas jokes bhi sun leti/lete ho, aur phir bhi mujhe cute samjhti/samajhte ho. Main promise karti/karta hoon tumhara personal joker banunga/banungi, snacks partner bhi. So, officially meri ban jao? Tumhari/Tumhara, chahe mano ya na mano, ${"{yourName}"}.`
    },
    {
      english: `${"{partnerName}"}, let us be honest - I am not perfect. I forget things, I am sometimes lazy, and my cooking is questionable. But you know what? I love you more than pizza, and that is saying something! You are my favorite notification, my most-used emoji, and the only person I would share my fries with. Will you be my partner in crime and in life? Warning: this offer comes with unlimited hugs! Love, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, honestly - main perfect nahi hoon. Bhool jaata/jaati hoon, lazy hoon, aur mera cooking toh... kharab hai. But tum jaante/jaanti ho? Main tumse pizza se bhi zyada pyaar karti/karta hoon, aur ye bada deal hai! Tum meri favorite notification ho, sabse zyada use kiya emoji ho. Apne fries bhi sirf tumhe doongi/doonga. Partner in crime banogi/banoge? Warning: unlimited hugs milenge! Pyaar se, ${"{yourName}"}.`
    }
  ],
  "deep-romantic": [
    {
      english: `${"{partnerName}"}, in the vast universe of countless souls, finding you feels like destiny breathing life into my existence. You are not just someone I love - you are the very essence of why I believe in love. Every heartbeat whispers your name, every dream paints your face. I do not just want to love you for a lifetime; I want to love you beyond time itself. Will you let our souls dance together through eternity? Forever bound to you, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, iss badi duniya mein tumhe paana kismet ka sabse bada tohfa hai. Tum sirf pyaar nahi, tum pyaar ki wajah ho. Meri har dhadkan tumhara naam leti hai, har khwaab mein tumhara chehra hai. Main tumhe sirf is janam mein nahi, har janam mein chahti/chahta hoon. Hamari roohein hamesha saath rahein? Tumhara/Tumhari hamesha ke liye, ${"{yourName}"}.`
    },
    {
      english: `${"{partnerName}"}, they say love is just a feeling, but what I feel for you transcends every definition. You have become the air I breathe, the light I see, the hope I hold. In your eyes, I found a home my soul had been searching for across lifetimes. I offer you not just my heart, but my entire being. Will you accept this love that knows no bounds, no end, no conditions? In this life and every life after, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, log kehte hain pyaar ek ehsaas hai, par tumhare liye jo main feel karti/karta hoon wo us se bahut zyada hai. Tum meri saans ban gayi/gaye ho, meri roshni, meri umeed. Tumhari aankhon mein maine wo ghar dhoondh liya jo meri rooh kayi janmon se dhoondh rahi thi. Main tumhe sirf dil nahi, apna poora wajood deti/deta hoon. Ye behadh pyaar accept karoge? Is janam aur har janam mein, ${"{yourName}"}.`
    }
  ],
  "poetic-vip": [
    {
      english: `${"{partnerName}"}, if love were written in poetry across the celestial sphere, your name would be its sweetest refrain. Every moment beside you feels consecrated with beauty, grace, and eternity. You are my greatest inspiration and my forever home. Will you walk hand-in-hand with me into infinity? With devotion that defies time, ${"{yourName}"}.`,
      hinglish: `${"{partnerName}"}, agar mohabbat koi shero-shayari hoti, toh tum uska sabse haseen misra hoti. Tumhare saath har lamha ek khwaab jaisa lagta hai jo sach ho gaya ho. Meri zindagi ki har subah aur har shaam sirf tumhare naam hai. Hamesha ke liye mere banoge? Poori rooh se tumhara, ${"{yourName}"}.`
    }
  ]
};

export function generateProposalMessage(params: GenerateProposalParams): string {
  const { yourName, partnerName, tone, language } = params;
  
  const templates = toneStyles[tone] || toneStyles["deep-romantic"];
  const randomIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomIndex];
  
  const rawText = template[language as "english" | "hinglish"] || template.english;
  
  const message = rawText
    .replace(/\{yourName\}/g, yourName)
    .replace(/\{partnerName\}/g, partnerName);
  
  return message;
}
