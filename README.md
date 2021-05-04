# Water Jug Search

An interactive website where you can visualize the search process for a computer solving the Water Jug Problem.

The site can be found here: <a href="https://water-jug-search.glitch.me/">https://water-jug-search.glitch.me/</a>

GitHub Repository: <a href="https://github.com/eddiekrystowski/water-jug-search/">https://github.com/eddiekrystowski/water-jug-search</a>

Created by: 
  - Eddie Krystowski (<a href="https://github.com/eddiekrystowski">https://github.com/eddiekrystowski</a>)
  - Joe Krystowski (<a href="https://github.com/joekrystowski">https://github.com/joekrystowski</a>)
-----------

## Water Jug Problem

If you are unfamiliar with the Water Jug problem, this is a simple form of the puzzle:
  - You are given (usually) 2 containers (Jug A and Jug B) to hold water, and you are aware of their sizes
  - There are 6 operations you can perform:
    1. Fill Jug A
    2. Fill Jug B
    3. Empty Jug A
    4. Empty Jug B
    5. Transfer<sup>[*]</sup> Jug A's water to Jug B
    6. Transfer<sup>[*]</sup> Jug B's water to Jug A
  - The goal of the puzzle is to have a matching amount of water in the jugs as specified by the problem.
  - It is impossible to accurately measure any quantity of water that does not completely fill a jug.
  - <sup>[*]</sup> Transferring stops immediately when the source jug is empty or the recieving jug is full. Thus, there is no 
  'spilling' or overflowing of jugs.

**Example**: If Jug A stores 3 gallons and Jug B stores 5 gallons, get 4 gallons in Jug B. 
In this example problem,
it doesn't matter what water level Jug A has, as long as Jug B has 4 gallons at any point, you have solved the problem.

-----------

## Instructions

Search Tree Graph:
- The left side of the screen is the area where the graph of the search tree will show up.
- The tiny gray/blue squares on a node with children can be used to hide/show its children, respectively.
- You can either grab and drag the graph or scroll on it to move around.
- After performing a search, you can see statistics about the search such as how long it took, how many nodes were checked,
and how long the solution path is, in the top right of the Search Tree Graph.

### Menu

*Note: The "Search" button must be clicked to apply any changes in the menu settings.*

Jug Information Table:
- Fill out the table with positive integers to specify the size and desired end water level (goal) of each jug.
- The size of a jug must be greater than or equal to its respective goal level.
- **NOTE:** *Putting a 0 in the goal entry for a jug will signify that it doesn't matter what the ending water 
level of that jug is*.

Operation Order:
- Use the drop down menu inorder to change the order in which the program will decide to evaluate the operations.
1 is first, 6 is last.

Search Order:
- Use the radio input buttons to switch between using Depth First and Breadth First Search.

Reset:
- Use the reset button to reset the menu settings to their default values.

Search Button:
- Use the search button to perform a search with your specified settings and output a graph of the search space.
- *Note: By default, all nodes will be uncollapsed after performing a search.*

(Un)Collapse All Button:
- Use this button to toggle between collapsing/uncollapsing all nodes. This is useful if you want to step through
a tree slowly, or want to shrink a large tree.

-----------

## About This Website

This website is a static site hosted for free by <a href="https://www.glitch.com">glitch.com</a>.

It is coded using Javascript, HMTL, CSS languages.

### JQuery 
<a href="https://jquery.com/">JQuery</a> is a popular Javascript Library that simplifies implementation of user 
interaction and HTML/DOM traversal. We used it mainly for adding interactivity to the search tree graph and marking
certain nodes (such as those on the solution path) for specific CSS styling.

### Treant.js
The drawing of the search tree was done by <a href="https://fperucic.github.io/treant-js/">Treant.js</a>, a Javascript library with
a robust tree graphing API. It has some limitations when it comes to large trees (see Notes section), but overall it was a huge time-saver
since outputting the search tree in a visually appealing and interactive manner is a very complex task.

-----------

## Notes

For the best experience, please use *Google Chrome* on a desktop. Other browsers, such as Safari, are unable to precisely time the
running time of the search. This website was *not designed for mobile use*.

Larger searches may cause the website to stop responding for some time. This is not due to the search algorithm, but rather the displaying
of the search space which can take a lot of time due to the amount of new elements added to the page.

Perform large searches at your own discretion. While the searching algorithm is fast, drawing and displaying the search tree
is not. Also note that the tree drawing library imposes a max tree size, so if trees get too deep, it will refuse to draw them fully,
and you may see a strange floating node all by itself. Unfortunately, this is out of our control.
