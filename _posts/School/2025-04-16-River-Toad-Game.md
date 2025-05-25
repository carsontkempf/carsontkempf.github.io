---
layout: post
title: "River-Toad-Game"
date: 2025-04-16 16:04:10 -0000
categories: [AI]
permalink: /River-Toad-Game/
---

# River Toad Game

* Game to be solved by multiple algorithms

---

## Introduction

* Turn based game like Frogger
* Mr. Toad dies if he runs out of hp or a snake eats him
* Mr. Toad can also eat flies for hp boosts

### Initially

* River and Banks are empty
* Mr. Toad begins in the center

---

## Mr. Toad

* Remains within the bottom row's river cells
* Each turn Mr. Toad may make an action

### Actions


| Action  | HP Lost |
|:-------:|:-------:|
| Left 2  |    3    |
| Left 1  |    1    |
|  Stay   |    0    |
| Right 1 |    1    |
| Right 2 |    3    |

### HP

* Mr. Toad loses HP according to his actions
* He can eat a fly to gain 5 hp

---

## Snakes

* Spawn at the top row according to roll values
* Can only spawn in the river cells
* Move down one row each turn
* Disappear when they reach the bottom row

---

## Flies

* Spawn at the top row according to roll values
* Can only spawn on the bank cells
* If Mr. Toad is adjacent to a fly, Mr. Toad gains 5 hp
* Disappear when they reach the bottom row

---

## Game Turn

* Represented in 5 Phases

### 1. Mr. Toad Moves

* Only moves within the river cells
* HP is updated
* Mr. Toad's HP cannot be negative

### 2. Snakes Move Down

* Snakes can only occupy the river cells

If a snake moves into an empty cell of the bottom row:

> The snake disappears

If the snake moves into the cell of the bottom row where Mr. Toad is:

> Mr. Toad is caught and the game is over (after the flies move down, and new entities spawn at the top row)

### 3. Flies Move Down

> Flies can only occupy the bank cells

If a fly moves into a cell directly adjacent to Mr. Toad:

> Mr. Toad gains 5 HP

If a fly moves into a cell at the bottom row and isn't eaten by Mr. Toad:

> The fly disappears

### 4. Entities Spawn

* The next roll is gotten from the input file
* Snakes, a fly, or nothing spawns at the top row

### 5. Evaluation

If Mr. Toad has 0 HP OR if Mr. Toad was caught by a snake:

> The game ends

---

### Victory Condition

* All the turns from the input file are completed
* Mr. Toad is still alive

---

## Spawning Snakes and Flies

* Always spawn at the top row of the game board
* Spawn according to the roll input

| Roll Number | Left Bank | River 1 | River 2 | River 3 | River 4 | River 5 | Right Bank |
|:-----------:|:---------:|:-------:|:-------:|:-------:|:-------:|:-------:|:----------:|
|      0      |    ""     |   ""    |   ""    |   ""    |   ""    |   ""    |     ""     |
|      1      |    ""     |   ""    |   ""    |   ""    |   ""    |    S    |     ""     |
|      2      |    ""     |   ""    |   ""    |   ""    |    S    |   ""    |     ""     |
|      3      |    ""     |   ""    |   ""    |   ""    |    S    |    S    |     ""     |
|      4      |    ""     |   ""    |   ""    |    S    |   ""    |   ""    |     ""     |
|      5      |    ""     |   ""    |   ""    |    S    |   ""    |    S    |     ""     |
|      6      |    ""     |   ""    |   ""    |    S    |    S    |   ""    |     ""     |
|      7      |    ""     |   ""    |   ""    |    S    |    S    |    S    |     ""     |
|      8      |    ""     |   ""    |    S    |   ""    |   ""    |   ""    |     ""     |
|      9      |    ""     |   ""    |    S    |   ""    |   ""    |    S    |     ""     |
|     10      |    ""     |   ""    |    S    |   ""    |    S    |   ""    |     ""     |
|     11      |    ""     |   ""    |    S    |   ""    |    S    |    S    |     ""     |
|     12      |    ""     |   ""    |    S    |    S    |   ""    |   ""    |     ""     |
|     13      |    ""     |   ""    |    S    |    S    |   ""    |    S    |     ""     |
|     14      |    ""     |   ""    |    S    |    S    |    S    |   ""    |     ""     |
|     15      |    ""     |   ""    |    S    |    S    |    S    |    S    |     ""     |
|     16      |    ""     |    S    |   ""    |   ""    |   ""    |   ""    |     ""     |
|     17      |    ""     |    S    |   ""    |   ""    |   ""    |    S    |     ""     |
|     18      |    ""     |    S    |   ""    |   ""    |    S    |   ""    |     ""     |
|     19      |    ""     |    S    |   ""    |   ""    |    S    |    S    |     ""     |
|     20      |    ""     |    S    |   ""    |    S    |   ""    |   ""    |     ""     |
|     21      |    ""     |    S    |   ""    |    S    |   ""    |    S    |     ""     |
|     22      |    ""     |    S    |   ""    |    S    |    S    |   ""    |     ""     |
|     23      |    ""     |    S    |   ""    |    S    |    S    |    S    |     ""     |
|     24      |    ""     |    S    |    S    |   ""    |   ""    |   ""    |     ""     |
|     25      |    ""     |    S    |    S    |   ""    |   ""    |    S    |     ""     |
|     26      |    ""     |    S    |    S    |   ""    |    S    |   ""    |     ""     |
|     27      |    ""     |    S    |    S    |   ""    |    S    |    S    |     ""     |
|     28      |    ""     |    S    |    S    |    S    |   ""    |   ""    |     ""     |
|     29      |    ""     |    S    |    S    |    S    |   ""    |    S    |     ""     |
|     30      |    ""     |    S    |    S    |    S    |    S    |   ""    |     ""     |
|     31      |    ""     |    S    |    S    |    S    |    S    |    S    |     ""     |
|     32      |     F     |   ""    |   ""    |   ""    |   ""    |   ""    |     ""     |
|     33      |    ""     |   ""    |   ""    |   ""    |   ""    |    F    |     ""     |


