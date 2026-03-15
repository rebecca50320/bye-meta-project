# BYE-META project

Status: In progress
Tags: Misc.

- initial thoughts
    
    I have a new product idea. I was listening to a podcast "[Brain Rot Emergency](https://youtu.be/EScgrk7oEwU?si=WoJpnxhvXQGeO10P)" about how social medias are effecting human brain and harm our ability to stay focus. I'm fully convinced and want to de-toxic a bit. But then I ran into pushbacks :
    
    1. I still want to be connected with my friends. I want to know their updates. Some daily snippets would not make it to our scheduled call or dinner becuase its too trivial or it just werent brought up in the conversation. And I could only learn them by low-effort instagram stories they posted.
    2. I record my life with instagram. I tried deleting the app a few years ago for about 6 months, although i feel really good about the result, I also feel a sense of pity because i have way less records of my life during that period. That period feels a bit blank. And the reason beneath that is because with out the motivation of sharing things on instagram, i dont record the moment that often. But often times, storing my track of life on a commercial platform that could be shut down and all my data will become unaccessible is frightening
    
    And now, I have some preliminary idea of a product that could balance between social media swiping vs staying connected to friends and keeping record of life. I want to build an app that will send a reminder on sunday evening, reminding you to go through the pictures you take in the week, pick 4 of them as the highlights of the week, and caption them. this is like a weekly diary.(serving the life recording need). This will be locally hosted as my personal diary. Secondly, for my close friends that cares about my life, they can provide their email and subscribe to my diary, and every sunday after i edited my dairy, they will get an email about the four featured pictures and my written caption. The key thing is that users only spend an evening in a week to socialize on this app. Other remaining time they could live social media-free and focus on the real life.
    
- reflections along the way
    
    **If I already have a clear idea of the product features I want to build, what is the value of going through formal product design steps like defining user personas and pain points?**
    The product design process is not mainly about discovering features, but about validating whether the features you want actually solve a clear and scalable user problem. These steps help clarify the core problem, establish design principles that prevent the product from drifting into something unintended, identify potential product risks early, and make the idea easier to communicate to collaborators, users, or investors. 我現在是因為很有靈感很有方向才開始打造產品；product design framework確保我在沒有明確想法時仍就可以come up with sth ex:hackathon 
    
- **Define Scope and Constraints**
    
    ### **Problem Context**
    
    Modern social media platforms maximize engagement through algorithmic feeds, infinite scrolling, and constant notifications, often leading to compulsive usage and reduced attention. However, these platforms also serve as personal memory archives and lightweight channels for staying updated with friends. When users leave social media to regain focus, they often lose both life documentation and ambient social awareness, creating a need for a lower-engagement alternative.
    
    ### **Core Value Proposition**
    
    1. **Weekly reflection for life recording:** Users maintain a structured weekly diary by reviewing photos taken during the week and selecting a small set of highlights accompanied by short captions or reflections.
    2. **High-signal sharing for staying connected:** Users can optionally share their weekly highlights with close friends who subscribe to their updates, allowing friends to stay informed about each other’s lives without continuous content consumption.
    3. **Attention-friendly social interaction:** The product limits posting and consumption to a weekly rhythm, avoiding algorithmic feeds and infinite scrolling avoid users from falling into addictive engagement loops.
    4. **User data sovereignty:** Diary entries are stored locally and shared through decentralized identity infrastructure, ensuring users retain long-term control over their personal data
    
    ### Product Scope
    
    The product is a **local-first mobile journaling app with low frequency high signal social sharing**.
    
    Each week, users receive a reminder to review the photos they captured during the week, select a limited number of highlights (e.g., four photos), and write short captions describing those moments. The resulting entry forms a weekly diary record.
    
    All diary entries are stored locally as part of the user’s personal archive.
    
    Users may optionally allow trusted friends to subscribe to their weekly highlights. Subscribers receive a curated summary of the user’s weekly entry.
    
- **Users Personas/ JTBD**
    
    ### **Current Behavior**
    
    They often take many photos during the week but rarely organize or revisit them.
    
    In the past, social media platforms such as Instagram served two purposes for them:
    
    1. documenting their life moments
    2. sharing updates with friends and stay informed about friends lives
    
    However, they increasingly feel uncomfortable with the attention demands, algorithmic feeds, and addictive usage patterns of traditional social media.
    
    ### **Internal Tension**
    
    They want to reduce or detox from traditional social media in order to protect their attention and focus.
    
    At the same time, they do not want to lose the benefits social media provided
    
    ### JTBD
    
    |  | Statement |
    | --- | --- |
    | Core | **When** I experience meaningful moments during my week,
    **I want** an easy way to capture and reflect on them,
    **so that** I can preserve memories and stay connected with friends without returning to addictive social media. |
    | functional |   1. Document meaningful moments from my daily life.
      2. Turn scattered photos into a coherent record of my life.
      3. Keep track of what happened during a week in a way that is easy to revisit later.
      4. Own my personal data
      5. Stay lightly updated about what close friends are doing. |
    | emotional |   1. Feel calm and free from social pressure.
      2. Feel in control of social media usage.
      3. Feel connected with close friends.
      4. Feel intentional about life.
      5. Feel present and mindful of everyday life. |
- **Product Statement: “*A slower social experience that helps people document their lives and stay connected with close friends without returning to addictive social media.*”**
- **Competitors Analysis**
    
    
    | Category | Primary Competitors | Design Philosophy | Limitations for This Use Case |
    | --- | --- | --- | --- |
    | **Traditional Social Media Platforms** | Instagram, Facebook | Maximize engagement through algorithmic feeds, continuous posting, and large audiences. Social interaction is frequent and public-facing. | Encourages compulsive usage through infinite scrolling and notifications. Addictive → brain rot; social comparison; appearance anxiety |
    | **Private Journaling Apps** | Day One, Apple Journal, Diarium | Focus on personal reflection and long-term life documentation. Strong archiving tools and personal metadata. | Completely private experience with no lightweight way to share updates with friends. Daily journaling often requires effort and discipline to maintain. |
    | **Low-Frequency Social Apps** | BeReal, Minutiae | Introduce constraints (e.g., daily or random posting windows) to reduce social pressure and encourage authenticity. | Focus on spontaneous capture rather than reflection or life documentation. Limited long-term archival structure for revisiting memories. |
    | **Private Sharing Networks** | Cluster, FamilyPine, Locket | Small-group sharing designed for families or private circles. Avoid public feeds and large audiences. | Designed for communication or quick sharing rather than structured life reflection. Often rely on centralized platforms. |
- **Features Brainstorming**
    
    mvp, v1, backlog
    
    1. Capture Moments During the Week 
        - photo auto import from album mvp
        - real time camera backlog
        - music of the week to express certain mood backlog
        - jot down some thoughts, memos backlog
    2. Weekly Reflection 
        - weekly reminder  v1
        - select 4 photos from the imported album mvp
        - reflection prompts to select photos: what i ate; where i went; who i spent time with etc backlog
        - turn into 4-Photo Grid vs 一張張往左滑  v1
        - editable functions to add captions on the 4-Photo Grid  v1
        - diary entry mvp
    3. Sharing with friends
        - friend subscription via email mvp
        - subscription via Nostr  v1
        - posts of subscribed friends’ 4-Photo Grid of the week  v1
        - friend subscription via email: even for friends not using the app backlog
    4. Longterm Documentation
        - gallery of past weeks’ grid  v1
        - calender timeline( similar to ig archieve stories) backlog
    5. Anti-Addiction Design Mechanisms
        - no unlimited scrolling: only posts of friends of that week  v1
        - weekly interaction window: only sunday evening mvp
        - quiet interface: minimal notifications  v1
            1. time to write journal
            2. “Your friends’ posts are ready”
        - no engagement metrics: no likes, no followers, no comments  v1
    6. Data Ownership and Memory Preservation
        - Diary entries are stored locally on the device.  v1
        - exportable files mvp
        - Entries remain accessible even if the service stops operating.  v1
        - Users control their identity and content distribution.  v1
- **Success Metrics**

---

[Tickets](BYE-META%20project/Tickets%20324e449a545e80e6ac8afc249a863da8.csv)