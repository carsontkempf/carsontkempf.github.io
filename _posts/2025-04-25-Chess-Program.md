---
layout: post
title: "Chess-Program"
date: 2025-04-25 13:46:00 -0000
categories: [AI]
permalink: /Chess-Program/
---

# Chess Program

---

## Scope

* Create a program that makes random **valid** chess moves
* Implement chess using the chess AI Framework

---

## Objectives

* Create a model of the game state and action generation

(to be used for future AI algorithms to solve)

### Overview

* Generate all pseudo-valid moves for all of your player's pieces in the current game state

* `Pseudo-valid == valid moves disregarding checks`

[Joueur](https://siggame.github.io/Joueur.py/)

[Joueur Class](https://siggame.github.io/Joueur.py/chess/index.html)

---

## Output

### On Each Turn

1. Print out in its own line: the number of moves available to your program
2. Print out in a single line: all moves available to your player program in alphabetical order
3. In the next line: print the randomly chosen move that the program returns to the chess server

* After, the program can print other stuff
* 