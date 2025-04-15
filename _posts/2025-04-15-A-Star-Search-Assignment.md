---
layout: post
title: "A-Star-Search-Assignment"
date: 2025-04-15 09:41:54 -0000
categories: [AI]
permalink: /A-Star-Search-Assignment/
---

---

# A* Search

--- 

## Assignment

Goal

* Create a program that implements A* Search over the River Toad game
* Implements graph search to determine the sequence of actions

---

## Specifications

### Input/Output Structure

* Same as previous projects

```
python3 src/puzzle4.py "$1" "$2"
```

$1
* Input file

$2
* Output file

### Output Grading

* Output file is the only thing being graded

'#'
* Bank Cell

' '
* Empty River Cell

'S'
* Snake Cell

'F'
* Fly Cell

'T'
* Toad Cell

'X'
* Dead Toad Cell

### Goal

* Mr. Toad is alive at the end of the search

---

## Heuristic Function

### Considering Mr. Toad Plans

* Determined by both
  1. Plan Cost
  2. A Heuristic Function

### Cost Function

cost(s)
* Returns the cost of reaching the game state s
* From the initial state

### Heuristic Function

h(s)
* Takes a game state s
* Returns an estimate of how close s is to the goal

### Graph Search Function

f(s) = cost(s) + h(s)
* Plans are explored in the order of f(s)

### Note

* cost(s) and h(s) functions should be clearly identified by the graders
* Not required that the heuristic function to lead to optimal solutions

---

## Initial Game Board Preconditions

* There is at least one way to achieve a victory from the initial input field

---

## Input File Format

```
5 # number of rolls following this line
21
21
10
14
27

```

--- 

## Output File Format

```
GAGAF
7
#SS SS#
# SSS #
# S S #
#S S S#
#   T #
``` 

---

## Notes

* Different implementations output different solutions

---

## Submission

### Main File

```
puzzle4.py
``` 

---

# Primer for Puzzle Assignment

---

## Intuition

* Explore the River Toad game tree
* Explore the plans by imposing the plans based on:
```
function of cost + heuristic function
```  
* Use a priority queue to store candidate plans

### Final Implementation

* Breadth-First Search
* With a priority queue instead of a regular queue

---

## Implementation

* Use the GameBoard and TransitionFunction()

### GameBoard

* A "snapshot" of the River Toad game
* Includes the location of Mr. Toad, the snakes, and the flies

### TransitionFunction(s,p) -> s'

Input
* s: a GameBoard
* p: A sequence of Mr. Toad's actions

Output
* s': the GameBoard that results from executing p in s

---

## Refining A* Search

### Main Change

* The frontier's priority-queue
* Sequences of actions / plans are now ordered by how far they are from the initial state
* Determined by a cost function + how close they get to the final goal (heuristic function)

---

## PseudoCode

```
FUNCTION River-Toad-Astar-GS
INPUT 
    s0 : the initial GameBoard
    goal(s) : boolean function that tests if the goal is true in GameBoard s.
    cost(s) : A cost function that returns the "cost" from the initial board to s.
    h(s) : A heuristic function that returns an estimate of the "cost" from s to the goal.
 
OUTPUT : a sequence of actions that takes the game from s0 to a state that satisfies the goal.

VAR frontier : Priority-Queue of sequences of actions.
               // Smallest priority value is highest priority

==============================================================================================
BEGIN
    enqueue [] (empty sequence) into frontier
    
    WHILE frontier is not empty
    
        dequeue sequence of actions p = [a0, a1, a2, ..., ak] from frontier
        // p has highest priority / smallest priority in frontier.
        
        sk ← TransitionFunction( s0, p )
        // sk is the GameBoard that results from executing p in s0
        
        IF goal(sk)
            RETURN p
            
        FOR every valid action a at sk
            px ← [a0, a1, a2, ..., ak, a]
            sx ← TransitionFunction( s0, px )
            // sx is the GameBoard that results from executing px in s0
            
            enqueue px into frontier with priority cost(sx) + h(sx)
            // cost() is the cost function
            // h() is the heuristic function
            
        ENDF
    ENDW
END.
```
---

## Further Refinement

* May use different cost and heuristic functions than the assignment
* Not required to implement pruning on this assignment
* It may help speed up execution