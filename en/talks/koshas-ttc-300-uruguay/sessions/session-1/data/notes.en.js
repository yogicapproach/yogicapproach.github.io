/* ============================================================================
   KOSHAS — Student Notes · Data layer
   Session 1 of 4 · Koshas TTC-300, Uruguay · Satchidananda · 2026-06-10
   ----------------------------------------------------------------------------
   This file holds ALL content, separated from presentation. Edit freely.
   `source` tags drive the UI badges:
     "talk"      → grounded in Session-1 transcript (quote/ref provided)
     "expansion" → teacher's framework to develop across sessions (not yet in talk)
   Refs point to transcript-en.md line numbers in the session folder.
   ============================================================================ */
window.KOSHAS_I18N = (window.KOSHAS_I18N || {});
window.KOSHAS_I18N.en = {
  meta: {
    title: "The Five Koshas",
    subtitle: "A Framework for Awareness",
    session: "Session 1 of 4",
    course: "300-Hour Teacher Training · Uruguay",
    teacher: "Satchidananda",
    host: "Ale",
    date: "10 June 2026",
    recording: "https://www.youtube.com/watch?v=fDUM_Rr7H-Q",
    note: "Built from the Session-1 transcript. Quotes are the teacher's words (some reconstructed from the live Spanish translation — verify ⚠ blocks against the recording). Fields marked ‘to develop’ are framework seeds for Sessions 2–4."
  },

  overview: {
    lead: "Don’t take the koshas as five boxes to memorise. Take them as a set of lenses — and learn to change the lens on demand.",
    framework: {
      quote: "I want you to see and experience the koshas as a framework — like a photographer who has a bag full of different lenses and puts on a different lens depending on the situation and the need. We want to be able to direct our awareness fluidly among the various koshas.",
      ref: "transcript-en.md:90"
    },
    why: {
      quote: "Otherwise, settling at the beginning of a class becomes a ritual rather than a practice that generates real change.",
      ref: "transcript-en.md:66"
    },
    tradition: {
      quote: "There is often a traditional presentation — which has immense value, because they are time-tested. But sometimes they are overly simplistic… it’s always left to the practitioner to take that and align it to themselves.",
      ref: "transcript-en.md:24"
    },
    carAnalogy: "A single metaphor runs through the whole talk: you, driving. The physical and energetic bodies are the car itself; the mind is how you handle the road; wisdom is choosing when and where to drive at all; and bliss is the felt sense of every system running in harmony.",
    courseArc: [
      { n: 1, label: "Today", body: "Theory — the koshas from the traditional presentation toward a more alternative one." },
      { n: 2, label: "Connection", body: "The koshas from the perspective of how to connect — between students and teachers." },
      { n: 3, label: "Society", body: "The koshas in relation to society, and how that affects us within these layers." },
      { n: 4, label: "Integration", body: "Exploring and deepening the koshas through what we’ve integrated in the earlier sessions." }
    ]
  },

  koshas: [
    {
      id: "annamaya",
      n: 1,
      sanskrit: "Annamaya",
      devanagari: "अन्नमय",
      english: "The Physical / Food Sheath",
      hue: 18,            // terracotta / earth
      etymology: { anna: "food", maya: "made of / pervaded by", kosha: "sheath, that which covers" },
      etymologyQuote: { text: "One translation of anna is ‘food’; maya is ‘layer’; and kosha is a layer, something that covers.", ref: "transcript-en.md:100" },
      traditional: "The physical sheath — skin, muscle, bone, and the inner system of organs, blood, fluids, nerves and fat. Called the ‘food layer’ because when we eat, we see the immediate effect on the body. Hatha Yoga brings awareness to its more internal layers.",
      modernLens: {
        name: "Entropy & Cohesion",
        body: "Reframe the body not as a fixed object but as a system of energy conversion holding itself together against the universe’s tendency to dissolve. Nothing in physics requires your body to cohere — yet over decades this ‘cloud’ has stayed together. That is the miracle the yogis paid attention to."
      },
      carMetaphor: "The car itself — chassis, seats, wheels, fuel: the tangible vehicle you travel in.",
      scale: { source: "talk", text: "Body-sized and personal — the layer most uniquely ‘yours.’ The whirlpool that is unmistakably one form, yet made of the same water as everything around it." },
      density: { source: "talk", text: "The densest sheath: condensed energy. ‘The physical body is condensed energy. That’s not hippie science — that’s modern science.’ Matter you cannot push your finger through." },
      nourishment: { source: "talk", text: "Food, touch, breath-into-tissue, deliberate sensation. Massaging the arms to feel density and variation; asking of any sensation, ‘where did this come from?’ — because it came from outside the body." },
      quotes: [
        { text: "A whirlpool is not different from the water — it is water — but it has a definite form and structure. That is what the human body is: a field of energy that has a definite form and a definite structure.", ref: "transcript-en.md:128" },
        { text: "The physical body — the Annamaya kosha — is a system of energy conversion.", ref: "transcript-en.md:130" },
        { text: "Entropy is this force or phenomenon in the universe… that dissolves everything.", ref: "transcript-en.md:120" }
      ],
      practice: "Each time you become aware of your physical body, ask: where did this come from? It definitely came from something outside the body itself.",
      practiceRef: "transcript-en.md:132",
      qa: [
        { q: "Why is the physical body called the “food sheath”?", a: "Because anna means food: when we eat, we see the immediate effect on the body. It is the densest sheath, built and maintained by what we take in." },
        { q: "The talk says the body is “condensed energy.” How does the whirlpool make that concrete?", a: "A whirlpool is not separate from the water — it is water given a definite form and structure. The body is likewise a field of energy holding a definite form; matter is energy, which aligns with modern physics." },
        { q: "What is entropy, and why does cohesion matter here?", a: "Entropy is the universal force that dissolves everything. Nothing in physics requires the body to hold together, yet over decades it does — a miracle of cohesion against dissolution, which the yogis studied closely." },
        { q: "What changes when we treat the body as a “system of energy conversion” instead of “I am the body”?", a: "“I am the body” leads us into problems. Seeing it as energy conversion lets us ask better questions — e.g. what in my environment is in contact with this energy and distorting my experience of the body right now?" },
        { q: "What single practice anchors this kosha?", a: "Each time you notice your physical body, ask “where did this come from?” It came from something outside the body itself — food, air, environment." }
      ]
    },
    {
      id: "pranamaya",
      n: 2,
      sanskrit: "Pranamaya",
      devanagari: "प्राणमय",
      english: "The Energetic / Pranic Sheath",
      hue: 35,            // amber / fire
      etymology: { prana: "vital force, life-energy", maya: "made of", kosha: "sheath" },
      etymologyQuote: { text: "Sometimes translated as the dimension of vitality or life-force… from the Hatha Yoga perspective, intimately connected to the nadis and the nervous system.", ref: "transcript-en.md:102" },
      traditional: "The dimension of vitality. In esoteric talk, the aura or field around the body; in Hatha Yoga, intimately tied to the nadis and the nervous system. The talk reserves deep work here for later sessions.",
      modernLens: {
        name: "State Transition",
        body: "Energy is what lets you shift gears between situations. Life presents many emotional landscapes; ideally you have a gear to shift into and can say, ‘I know how to handle this new landscape.’ Your ability — or inability — to make that shift is what frees you or keeps you stuck."
      },
      carMetaphor: "The gearbox / transmission — what lets you transition from two-wheel to four-wheel drive when you leave the highway for the mountain.",
      scale: { source: "talk", text: "A field through and around the body — dynamic by nature, constantly fluctuating. It reminds us we are never static." },
      density: { source: "talk", text: "Subtler than matter, more mobile — felt as flow, charge, and change of state rather than as solid form." },
      nourishment: { source: "talk", text: "Where does energy come from, and where is it lost? ‘What are the sources of energy? What are the exit points for prana? How do I attract it to myself? What is my capacity to retain it? And from what points do I lose it?’" },
      nourishmentRef: "transcript-en.md:102",
      quotes: [
        { text: "Your ability to shift on demand, to move from one situation to another, is called a state transition.", ref: "transcript-en.md:134" },
        { text: "Life presents these various emotional landscapes, and ideally we have a gear we can shift to and say, ‘I know how to handle this.’", ref: "transcript-en.md:134" }
      ],
      practice: "Through the day, notice the moments of state transition — after dinner, after a shower, getting into the car. Name the gear you’re shifting into.",
      practiceRef: "transcript-en.md:68",
      qa: [
        { q: "What is the modern lens for the energetic body?", a: "State transition — the ability to shift gears between situations, like moving from two-wheel to four-wheel drive when the road changes from highway to mountain." },
        { q: "In the car analogy, which part is the pranic body?", a: "The gearbox / transmission — not the chassis or the fuel, but what lets you transition between modes on demand." },
        { q: "What four questions does the talk pose for evaluating your prana?", a: "What are the sources of energy? What are the exit points for prana? How do I attract and retain it? And from what points do I lose it?" },
        { q: "Why is “state transition” practical for emotional life?", a: "Life presents many emotional landscapes; ideally you have a gear to shift into and can say “I know how to handle this.” The inability to shift is what keeps us stuck in one landscape." },
        { q: "How does this kosha relate to the nervous system?", a: "From the Hatha Yoga perspective it is intimately connected to the nadis and the nervous system — the dimension of vitality, dynamic by nature and always fluctuating." }
      ]
    },
    {
      id: "manomaya",
      n: 3,
      sanskrit: "Manomaya",
      devanagari: "मनोमय",
      english: "The Mental Sheath",
      hue: 190,           // teal / mind
      etymology: { manas: "mind", maya: "made of", kosha: "sheath" },
      etymologyQuote: { text: "Manu refers to the mind; maya again as a veil; kosha as the space of that mental layer.", ref: "transcript-en.md:104" },
      traditional: "The mental layer, split usefully into the lower mind (perception, memory, some cognition) and the higher mind (intellect, discernment / viveka, reflection, contemplation, meditation). Much of Raja Yoga works here.",
      modernLens: {
        name: "Attention Management",
        body: "A great car you can drive still won’t save you from every situation. When the storm hits or the leopard jumps onto the road, what lets you respond is the capacity to direct attention. To work with the Manomaya kosha is to work with all the subsystems of attention."
      },
      carMetaphor: "Driving in changing conditions — are you on the Spotify playlist, or can you rotate attention to the leopard arriving on the road?",
      scale: { source: "talk", text: "Reaches across time — not just the present moment but the whole week, the last ten years. ‘Where was my attention in that moment, or over the whole week, or the last ten years?’" },
      density: { source: "talk", text: "Subtler than energy; experienced as thought, perception and discernment. Two strata: lower mind (perception/memory) and higher mind (intellect/viveka)." },
      nourishment: { source: "expansion", text: "To develop: deliberate attention, study, quality sensory input, and Raja-yoga practices that train the mind to hold and redirect focus. (Talk emphasises attention as the trainable faculty here.)" },
      quotes: [
        { text: "What lets you respond to the changes within that landscape is the capacity to direct attention, which is within the field of the Manomaya kosha.", ref: "transcript-en.md:136" },
        { text: "Many of the biggest problems we face as humans are not because a rock fell from the sky, but because we ignored a situation right in front of us for long periods of time.", ref: "transcript-en.md:138" }
      ],
      practice: "Once a day ask: where was my attention most directed today? Chart it through to the last session — a simple sadhana journal that paints pictures you might not have realised.",
      practiceRef: "transcript-en.md:200",
      qa: [
        { q: "What is the modern lens for the mental body?", a: "Attention management — working with all the subsystems that direct and hold attention." },
        { q: "What is the difference between the lower and higher mind?", a: "Lower mind: perception, memory, some cognition. Higher mind: intellect, discernment (viveka), evaluation, reflection, contemplation, meditation — much of Raja Yoga’s domain." },
        { q: "How does the leopard illustrate attention?", a: "When a leopard jumps onto the road, can you rotate attention from the Spotify playlist to what is actually happening? Responding to a changing landscape is a function of directed attention." },
        { q: "How does the talk reframe many life problems as attention problems?", a: "Many big problems are not a rock falling from the sky but a situation we ignored for a long time. The question becomes: where was my attention all that time — that week, those ten years?" },
        { q: "What practice trains this kosha?", a: "Ask once a day “where was my attention most directed today?” and chart it — a simple sadhana journal that reveals patterns you didn’t notice." }
      ]
    },
    {
      id: "vijnanamaya",
      n: 4,
      sanskrit: "Vijnanamaya",
      devanagari: "विज्ञानमय",
      english: "The Wisdom Sheath",
      hue: 255,           // indigo / intuition
      etymology: { vijnana: "wisdom, deep knowing", maya: "made of", kosha: "sheath" },
      etymologyQuote: { text: "Vijnana means wisdom, and maya kosha the space where that wisdom is expressed.", ref: "transcript-en.md:106" },
      traditional: "The body of wisdom and intuition — more abstract. Where the physical body is unique to our personal identity, the wisdom body begins to draw us out of ourselves and place us within the context of a larger whole. A first level at which ideas like the collective conscious become useful.",
      modernLens: {
        name: "Pattern Recognition",
        body: "The calmer driver says: ‘I’ve never had to hit a leopard. I don’t drive when the leopards are out — and I check the weather before storms.’ Pattern recognition is the root of yoga, of Ayurveda, of all the ancient and modern sciences: recognising ‘I have seen this before,’ and asking whether a thread connects every similar experience."
      },
      carMetaphor: "Not handling the road better — choosing when and where to drive at all, by reading the patterns of leopards and weather.",
      scale: { source: "talk", text: "The widest yet — it pulls the point-self into a much larger space we call reality. ‘Phenomena scale at every layer’: what we see in the microcosm is possibly happening in the macrocosm at another scale." },
      scaleRef: "transcript-en.md:144",
      density: { source: "talk", text: "Abstract and intuitive — ‘from this body onward it becomes a little more abstract.’ Felt less as content, more as connection and recognition." },
      nourishment: { source: "expansion", text: "To develop: reflection, contemplation, exposure to many experiences to compare, and imagination — ‘we can imagine what other people might be feeling, and connect with that emotion deeply.’" },
      nourishmentRef: "transcript-en.md:142",
      quotes: [
        { text: "Pattern recognition is the root of the whole field of yoga, of Ayurveda, of all the modern and ancient sciences.", ref: "transcript-en.md:142" },
        { text: "If I can recognize personal patterns, in some way that is helping me to experience and explore universal patterns.", ref: "transcript-en.md:144" },
        { text: "The wisdom body begins to draw us out of ourselves and place us within the context of a larger whole.", ref: "transcript-en.md:106" }
      ],
      practice: "When something recurs in your life, hold the question: is there a connected thread between every point, every similar experience? Let that reflection place you in a larger context.",
      practiceRef: "transcript-en.md:142",
      qa: [
        { q: "What is the modern lens for the wisdom body?", a: "Pattern recognition — recognising “I have seen this before,” and asking whether a thread connects every similar experience." },
        { q: "How does the “calmer driver” differ from the merely skilled one?", a: "The skilled driver brakes for every leopard and powers through every storm. The calmer driver checks the weather and doesn’t drive when leopards are out — choosing when and where to drive, not just handling the road." },
        { q: "Why is pattern recognition called the root of yoga, Ayurveda and the sciences?", a: "All of them rest on recognising recurring patterns and connecting them; that capacity pulls the point-self into the larger space we call reality." },
        { q: "What does “phenomena scale at every layer” mean?", a: "What we see in the microcosm is possibly happening in the macrocosm at another scale. Recognising personal patterns helps us explore universal ones." },
        { q: "How does this kosha relate to empathy and imagination?", a: "Recognising patterns lets us imagine a future we haven’t lived and imagine what others feel — connecting with that emotion deeply, drawing us out of ourselves into a larger whole." }
      ]
    },
    {
      id: "anandamaya",
      n: 5,
      sanskrit: "Anandamaya",
      devanagari: "आनन्दमय",
      english: "The Bliss Sheath",
      hue: 45,            // luminous gold
      etymology: { ananda: "bliss, beatitude; the unchanging", maya: "made of", kosha: "sheath" },
      etymologyQuote: { text: "Ananda is usually translated as bliss or beatitude, but it can also be seen as the uniform, the pure, that which does not change.", ref: "transcript-en.md:108" },
      traditional: "The bliss body. Ananda as bliss or beatitude — but also as the uniform, the pure, that which does not change.",
      modernLens: {
        name: "Baseline Coherence",
        body: "What is the felt sense when the car runs perfectly — transmission needing zero attention, every sensor reporting correct and on time, climate and steering right, and you know where you’re going? That harmony of all systems at their optimum is a hint of Anandamaya: a state of non-duality, of non-conflict with any other system."
      },
      carMetaphor: "Not a part of the car — the felt sense when every part is working in harmony at once.",
      scale: { source: "talk", text: "Universal and non-dual — ‘a frequency we align with… that pervades each of the koshas and the whole universe.’ Not a layer beside the others but the coherence underlying them." },
      scaleRef: "transcript-en.md:214",
      density: { source: "talk", text: "The uniform, the pure, that which does not change — the still ground beneath the four fluctuating sheaths." },
      nourishment: { source: "talk", text: "Not added from outside but uncovered: ‘peace is not something we have to add to ourselves; we only have to manage the other distractions.’ It is experienced when the other four koshas function harmoniously." },
      nourishmentRef: "transcript-en.md:148",
      quotes: [
        { text: "Baseline coherence — a state of non-duality, or non-conflict with any other system.", ref: "transcript-en.md:146" },
        { text: "We are intrinsically beings of peace — peace is not something we have to add to ourselves; we only have to manage the other distractions.", ref: "transcript-en.md:148" },
        { text: "The Anandamaya kosha can truly be experienced when the other four koshas are functioning harmoniously.", ref: "transcript-en.md:148" }
      ],
      practice: "Recall a moment when every system felt right at once — body, energy, mind, knowing. Don’t reach for it; just notice it is already your baseline beneath the distractions.",
      practiceRef: "transcript-en.md:146",
      qa: [
        { q: "What is the modern lens for the bliss body?", a: "Baseline coherence — a state of non-duality, of non-conflict with any other system." },
        { q: "How does the perfectly-running car point to ananda?", a: "When the transmission needs zero attention, every sensor reports correct and on time, climate and steering are right, and you know where you’re going — that harmony of all systems at their optimum is a hint of Anandamaya." },
        { q: "What is the surprising claim about peace?", a: "We are intrinsically beings of peace; peace is not something we add — we only have to manage the distractions in the other four koshas." },
        { q: "Besides “bliss,” how else can ananda be understood?", a: "As the uniform, the pure, that which does not change — the still ground beneath the four fluctuating sheaths." },
        { q: "When can this kosha actually be experienced?", a: "When the other four koshas are functioning harmoniously — which is why an integrated lifestyle attends to all of them rather than over-focusing on one." }
      ]
    }
  ],

  between: {
    lead: "The richest material lives between the sheaths — where a phenomenon refuses to sit in one box, where imbalance in one layer leaks into another, and where the framework becomes a diagnostic tool for yourself and your students.",
    sections: [
      {
        id: "emotions",
        title: "Emotions cross the koshas",
        source: "talk",
        body: "A student asked whether emotions belong to the physical kosha. The answer: emotions don’t live in any single sheath — they arise and move through all of them. ‘Emotion is energy in motion’; when energy moves and connects with meaning, we feel it as emotion. The first interface for feeling is the body — ‘a marvellous interface’ — and if the body’s signals aren’t heard by the mind, we distort our environment until we ask, ‘wait, how did I get here?’",
        quotes: [
          { text: "I don’t think emotions are in any one kosha, but a phenomenon that arises and moves through them.", ref: "transcript-en.md:176" },
          { text: "It’s much easier to be physically balanced than emotionally balanced, on any timeline.", ref: "transcript-en.md:180" }
        ],
        aside: "It’s not an accident that Bhakti Yoga comes fourth in the progression — emotion is an advanced class in being human."
      },
      {
        id: "rotation",
        title: "Rotating awareness through all five",
        source: "talk",
        body: "The opening settling was itself a rotation of awareness through the koshas — body, energy, mind, knowing, bliss. It can be done any time of day; many traditions share this settling. Crucially: ‘awareness of that state itself seems to have the effect of regulating us.’ Sensing whether each system is balanced or imbalanced is already the intervention.",
        quotes: [
          { text: "The settling we just did is a way of rotating awareness through the koshas. It can be done at any time of day.", ref: "transcript-en.md:64" }
        ]
      },
      {
        id: "self-and-class",
        title: "Working with the koshas — on yourself and in a class",
        source: "expansion",
        body: "To develop (Session 2 theme): how to use the koshas when working on yourself versus when leading students. Building a settling sequence that produces real change rather than ritual; reading the room across layers; and the teacher↔student connection through the sheaths. The talk’s seed: develop a short sequence you can do in any environment — getting in the car, stepping out of the shower, arriving home — and it will change how you interact with your students.",
        quotes: [
          { text: "When you begin to find a sequence that truly works for you… it will change the way you interact with others, including your students.", ref: "transcript-en.md:68" }
        ]
      },
      {
        id: "imbalance",
        title: "Diagnosing imbalance & restoring balance",
        source: "expansion",
        body: "To develop: a practical method for spotting which kosha is over- or under-active in yourself and others, and choosing the branch of yoga that rebalances it. The talk’s seed: some people feel a lack of peace mentally and are drawn to Raja Yoga; others feel it through the body (allergies, digestion, illness, non-acceptance) and over-focus there — single-food diets, gym, too many supplements. ‘We all move, in different proportions, across this whole spectrum.’ An integrated lifestyle attends to all five.",
        quotes: [
          { text: "An integrated yogic lifestyle would give attention to all of these koshas… the Anandamaya kosha can truly be experienced when the other four are functioning harmoniously.", ref: "transcript-en.md:148" }
        ]
      },
      {
        id: "lifestyle",
        title: "Lifestyle choices ↔ the koshas",
        source: "expansion",
        body: "To develop: map everyday activities and lifestyle choices to the kosha they feed or deplete — diet and movement (annamaya), breath, rest and nature (pranamaya), media and study (manomaya), reflection and exposure to variety (vijnanamaya), and the conditions under which baseline coherence (anandamaya) surfaces. The awareness-work homework seeds this: list every component you think belongs to each kosha."
      },
      {
        id: "elements",
        title: "Five elements ↔ five koshas",
        source: "expansion",
        body: "To develop (proposed mapping — not stated in the talk): the pancha mahabhuta as a parallel spectrum from gross to subtle — earth↔Annamaya (densest form), water/fire↔Pranamaya (flow & transformation), air↔Manomaya (movement of mind), ether/akasha↔Vijnanamaya (spacious knowing), and the beyond-elemental↔Anandamaya. Offered as an exploration to test against experience, in the spirit of ‘phenomena scale at every layer.’",
        flag: "Proposed framework — verify against tradition before teaching as canonical."
      },
      {
        id: "chakras",
        title: "Chakras ↔ koshas (open question)",
        source: "expansion",
        body: "To develop (open question — not in the talk): chakras live primarily within the pranamaya and manomaya fields, so a clean 1:1 chakra↔kosha mapping is unlikely. Worth exploring: how the seven-chakra vertical axis intersects the five-sheath nested model, and where they genuinely correspond versus where forcing a map distorts both.",
        flag: "Open question — likely not a 1:1 mapping; explore carefully."
      },
      {
        id: "scale-insight",
        title: "Phenomena scale at every layer",
        source: "talk",
        body: "A core Vijnanamaya insight that ties the whole framework together: what shows up in the microcosm is possibly happening in the macrocosm at another scale. Recognising personal patterns becomes a way of exploring universal ones — which is why ‘scale’ and ‘density’ make natural axes for comparing the koshas to each other.",
        quotes: [
          { text: "Phenomena scale at every layer — what we see in the microcosm is possibly happening in the macrocosm at another scale.", ref: "transcript-en.md:144" }
        ]
      }
    ],
    qa: [
      { q: "Which kosha do emotions belong to?", a: "None exclusively — emotions arise and move through all of them. “Emotion is energy in motion”; when energy moves and connects with meaning, we feel it as emotion." },
      { q: "Why is the body called “the first interface for feeling”?", a: "It is where feeling first registers. If the body’s signals aren’t heard by the mind, we distort our environment until we ask “how did I get here?” A sensitive, worked-with body keeps us attentive to what an emotion is pointing to." },
      { q: "Why is it “not an accident” that Bhakti Yoga comes fourth?", a: "Emotion is an advanced class in being human — it is much easier to be physically balanced than emotionally balanced — so the devotional path sits later in the progression." },
      { q: "How do you tell which kosha needs attention in yourself or a student?", a: "Notice where peace feels missing: some feel it mentally and are drawn to Raja Yoga; others through the body — allergies, diet, illness, the gym. We all move across the spectrum; an integrated lifestyle attends to all five." },
      { q: "What is the point of “rotating awareness” through the koshas?", a: "Settling through each layer lets you sense whether each system is balanced. Awareness of that state itself has the effect of regulating us — otherwise settling becomes a ritual, not real change." }
    ]
  },

  practices: [
    {
      id: "opening",
      title: "Opening — Guided Settling",
      kind: "Rotation of awareness through the koshas",
      steps: [
        "Arrange the body as if you were going to sit for an hour — base stable, spine supported, symmetry from toes to hips on each side, hands in a mudra, eyes and mouth gently closed.",
        "Without focusing on anything in particular, notice: is attention drawn to a part or the whole body? To your energetic state? To movements of the mind — sounds, temperature, situations you’ve been turning over?",
        "Rewind the night: replay the hours before sleep like a film; sense when the shift toward sleep began; move through the night (deep or light? dreams?); recall the first details of waking and which parts of you woke first.",
        "Observe the breath and gradually deepen it in both directions — a little fuller each time — noticing how attending to breath involves body and mind together.",
        "Palming: rub the hands warm, cover the eyelids, let warmth enter the eyes and travel down the spine. Hari Om Tat Sat. Lower the hands and gently open the eyes."
      ],
      ref: "transcript-en.md:34-56"
    },
    {
      id: "closing",
      title: "Closing — Breath through the Koshas + OM",
      kind: "Integration",
      steps: [
        "Sit comfortably, body balanced, hands in a mudra, eyes and mouth gently closed. Notice how you are right now without reaching for any state.",
        "Take one full breath from physical toward causal — passing through each kosha, from Annamaya toward Anandamaya.",
        "Imagine OM pervading each kosha and the whole universe — a frequency you align with. Recite OM followed by shanti, shanti, shanti.",
        "A round of palming; cover the eyes with a little warmth. Breathe in; release the hands when ready. Hari Om Tat Sat."
      ],
      ref: "transcript-en.md:212-218"
    },
    {
      id: "awareness-work",
      title: "Awareness Work (not homework)",
      kind: "Between sessions — optional",
      steps: [
        "Once a day, ask: where was my attention most directed today? Chart it through to the last session — a spiritual journal, a sadhana.",
        "Go through the five koshas and list every component you think belongs to each — skeletal, muscular, respiratory… modern, yogic, or both. You may even ask ChatGPT and simply listen to its answer once before the next session.",
        "‘If you do this, I’ll turn the data into graphs.’ No grading — it’s awareness work, not homework."
      ],
      ref: "transcript-en.md:200-202"
    }
  ],

  awareness: {
    lead: "Awareness work — not homework (it won’t be graded). Small, repeatable exercises from the talk that train each kosha in the flow of an ordinary day.",
    groups: [
      {
        kosha: "Annamaya · the body",
        hue: 18,
        items: [
          { text: "Each time you become aware of your physical body, ask: “where did this come from?” It came from something outside the body itself.", ref: "transcript-en.md:132" },
          { text: "Deeply massage your arms and fingers. In a coarse way, feel the matter of your body — that you cannot push your fingers through the skin — and notice the variation in density from skin to muscle to joint.", ref: "transcript-en.md:100" }
        ]
      },
      {
        kosha: "Pranamaya · energy",
        hue: 35,
        items: [
          { text: "Evaluate your prana: where are its sources? Its exit points? How do you attract and retain it — and from what points do you lose it?", ref: "transcript-en.md:102" },
          { text: "Through the day, catch the moments of state transition — after dinner, stepping out of the shower, getting into the car — and name the gear you’re shifting into.", ref: "transcript-en.md:134" }
        ]
      },
      {
        kosha: "Manomaya · mind",
        hue: 190,
        items: [
          { text: "Once a day, ask: “where was my attention most directed today?” Keep a short spiritual journal (sadhana) and chart it through to the last session.", ref: "transcript-en.md:200" },
          { text: "When you feel pain or suffering, trace the cause back to attention: where was my attention in that moment — that week, those ten years?", ref: "transcript-en.md:138" }
        ]
      },
      {
        kosha: "Vijnanamaya · wisdom",
        hue: 255,
        items: [
          { text: "When something recurs, hold the question: is there a connected thread between every similar experience? Let it place you in a larger context.", ref: "transcript-en.md:142" }
        ]
      },
      {
        kosha: "Anandamaya · bliss",
        hue: 45,
        items: [
          { text: "Recall a moment when every system felt right at once — body, energy, mind, knowing. Don’t reach for it; just notice it as the baseline beneath the distractions.", ref: "transcript-en.md:146" }
        ]
      },
      {
        kosha: "Across all five",
        hue: 280,
        items: [
          { text: "Go through the five koshas and list every component you think belongs to each — skeletal, muscular, respiratory… modern, yogic, or both. You may even ask ChatGPT and simply listen to its answer once before the next session.", ref: "transcript-en.md:202" },
          { text: "Each time you hear or say a kosha’s name, repeat the word and bring your awareness to that body. Kept up across the four talks, it becomes a practice lasting weeks.", ref: "transcript-en.md:118" },
          { text: "Ask yourself: over the past months, which kosha (one or two) have I been predominantly in? Not good or bad — just where you find yourself.", ref: "transcript-en.md:190" }
        ]
      }
    ]
  }
};
