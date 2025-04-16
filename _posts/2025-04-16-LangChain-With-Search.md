---
layout: post
title: "LangChain-With-Search"
date: 2025-04-16 08:42:31 -0000
categories: [LangChain]
permalink: /LangChain-With-Search/
---

---

# LangChain Output

[View in Google Collab](https://colab.research.google.com/drive/1SHFotzlgidp7ciQY6Hbbxi6qfnjiaTlv?usp=sharing)

---

## Explanation

### Human Message

* We separate each chat by the 'role' variable
* The Human Message role simulates a query to the deepseek ai

### Ai Message

* Simulates the Ai Message 'role' in the conversation

### Tool Calls

* The GPT returns which tools it wants to use after the initial query

### Tool Response (Tavily Search API)

* The GPT response sets off the Tavily search API
* Tavily search API returns a summarized output meant for LLMs

### Final Ai Message

* Returns the response to the initial query
* Response includes the summarized tool call

---

# Output

---

## Step 1

* Human Message
* AI Tool Call

```
===== Query: Tariff News =====
================================ Human Message =================================

Describe the latest news on international trade tariffs 2025.
================================== Ai Message ==================================
Tool Calls:
  TavilySearch (call_0_a2bc101d-6b2e-48ba-be89-d55aa673c09f)
 Call ID: call_0_a2bc101d-6b2e-48ba-be89-d55aa673c09f
  Args:
    __arg1: latest news on international trade tariffs 2025
 ```

---

## Step 2

* Search API Response

```
================================= Tool Message =================================
Name: TavilySearch

{
  "query": "latest news on international trade tariffs 2025",
  "follow_up_questions": null,
  "answer": null,
  "images": [],
  "results": [
    {
      "title": "US tariffs move could see three per cent fall in global trade ... - UN News",
      "url": "https://news.un.org/en/story/2025/04/1162151",
      "content": "US tariffs move could see three per cent fall in global trade, says top UN economist | UN News ![Image 2: Pamela Coke-Hamilton, Executive Director of the International Trade Centre (ITC).](https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Libraries/Production%20Library/11-04-2025-UN-News-Pamela-Coke-Hamilton.jpg/image1170x530cropped.jpg) There will be geopolitical shifts and economic as well,\u201d said Pamela Coke-Hamilton, head of the International Trade Centre (ITC). As governments and global markets struggle to deal with the deep concerns and disruptions caused by volatility over trade tariffs, Rebeca Grynspan, the head of the UN trade and development agency (UNCTAD), told UN News on Thursday that the poorest countries \u2013 whose activities have a negligible effect on trade deficits \u2013 should be exempt.",
      "score": 0.8302782,
      "raw_content": null
    },
    {
      "title": "Trump's tariffs risk a global trade war, as leaders plan next steps",
      "url": "https://www.cnbc.com/2025/04/02/trump-tariffs-live-updates.html",
      "content": "This was CNBC's coverage of President Donald Trump's April 2, 2025, announcement of new tariffs targeting dozens of U.S. trade partners. Pharmaceutical companies breathed a sigh of relief Wednesday after U.S. President Donald Trump revealed that they would not be subject to reciprocal tariffs \u2014 but that reprieve could prove fleeting as the White House moves ahead with plans for the sector. President Donald Trump and the White House laid out the U.S. reciprocal tariff rates that more than 180 countries and territories will face under his sweeping new trade policy. Exchange-traded funds tied to major U.S. stock indexes fell sharply in after-hours trading Wednesday after President Trump imposed sweeping tariffs on goods imported to the U.S. The SPDR S&P 500 ETF Trust (SPY) tumbled 2.2%.",
      "score": 0.8020137,
      "raw_content": null
    },
    {
      "title": "International Trade Law Updates for March 2025 - National Law Review",
      "url": "https://natlawreview.com/article/br-international-trade-report-march-2025",
      "content": "U.S. trade deficit rose sharply in January ahead of Trump tariffs. The U.S. trade deficit grew by 34 percent in January to $131.4 billion, largely driven by a 10 percent increase in imports, which",
      "score": 0.7451949,
      "raw_content": null
    },
    {
      "title": "Here's what's about to become more expensive with the next round of ...",
      "url": "https://www.cnn.com/2025/04/15/economy/next-round-of-tariffs-cost/index.html",
      "content": "CNN10 About CNN \u201cThe risk from [imposing duties] on imports of products where there are few substitutes is certainly greater, and that\u2019s why there have been some exemptions and reductions in tariffs and exclusions of products that are of key importance to the US,\u201d Gregory Daco, chief economist at EY-Parthenon, told CNN in an interview. Although the bipartisan CHIPS and Science Act passed during the Biden administration helped incentivize chipmakers like TSMC to open US facilities, even if tariffs do spur more domestic chip production, America still lacks electronic assembly capabilities, John Dallesasse, an electrical and computer engineering professor at the University of Illinois Urbana-Champaign, previously told CNN. These are the hardest-hit US trading partners under Trump\u2019s tariffs Apr 4, 2025 3 minute readmin read More from CNN CNN10 About CNN",
      "score": 0.6102915,
      "raw_content": null
    },
    {
      "title": "Regulating Imports with a Reciprocal Tariff to Rectify Trade Practices ...",
      "url": "https://www.whitehouse.gov/presidential-actions/2025/04/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and-persistent-annual-united-states-goods-trade-deficits/",
      "content": "TRUMP, President of the United States of America, find that underlying conditions, including a lack of reciprocity in our bilateral trade relationships, disparate tariff rates and non-tariff barriers, and U.S. trading partners\u2019 economic policies that suppress domestic wages and consumption, as indicated by large and persistent annual U.S. goods trade deficits, constitute an unusual and extraordinary threat to the national security and economy of the United States.",
      "score": 0.1476169,
      "raw_content": null
    }
  ],
  "response_time": 1.36
}
```

---

## Step 3

* Query Response


================================== Ai Message ==================================

Here are some of the latest updates on international trade tariffs for 2025:

1. **UN News Report**:
   - The U.S. tariffs could lead to a 3% decline in global trade, according to a top UN economist. The International Trade Centre (ITC) highlighted concerns about geopolitical and economic shifts due to tariff volatility. There are calls for exemptions for the poorest countries, as their trade activities have minimal impact on trade deficits.
   - [Read more here](https://news.un.org/en/story/2025/04/1162151)

2. **CNBC Coverage**:
   - President Donald Trump announced new tariffs targeting over 180 countries, raising fears of a global trade war. While pharmaceutical companies were temporarily exempt, the broader implications for U.S. stock markets and trade partners were significant.
   - [Details here](https://www.cnbc.com/2025/04/02/trump-tariffs-live-updates.html)

3. **National Law Review**:
   - The U.S. trade deficit surged by 34% in January 2025, driven by increased imports, ahead of the implementation of new tariffs.
   - [More information](https://natlawreview.com/article/br-international-trade-report-march-2025)

4. **CNN Analysis**:
   - The next round of tariffs is expected to make certain products more expensive, with exemptions for critical items. The U.S. still faces challenges in domestic production, particularly in electronics assembly.
   - [Full article](https://www.cnn.com/2025/04/15/economy/next-round-of-tariffs-cost/index.html)

5. **White House Announcement**:
   - President Trump issued a directive to regulate imports with reciprocal tariffs, citing persistent trade deficits as a threat to national security and the economy.
   - [Official statement](https://www.whitehouse.gov/presidential-actions/2025/04/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and-persistent-annual-united-states-goods-trade-deficits/)

These updates highlight the ongoing debates and impacts of trade tariffs on global markets and economies. Let me know if you'd like more details on any specific aspect!

---

## Step 4

* Query Without Tool Call

===== Query: Who built you? =====

================================ Human Message =================================

Who built you?

================================== Ai Message ==================================

I was created by **OpenAI**, a research organization focused on developing artificial intelligence to benefit humanity. OpenAI is known for its advancements in AI technologies, including models like GPT-3 and GPT-4, which power assistants like me. My purpose is to assist users by providing information, answering questions, and helping with various tasks. Let me know how I can assist you!

