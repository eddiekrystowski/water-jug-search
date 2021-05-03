/* global p5 Jug Search Treant NODES_CHECKED $ millis*/




let SEARCH_TYPE = "DFS";
let TREE = undefined;

//takes in operation as HTML class name and returns a neater version
//for using on nodes to determine their operation
function getCommandName(className){
  switch(className){
    case "fill-a": return "Fill A"; break;
    case "fill-b": return "Fill B"; break;
    case "empty-a": return "Empty A"; break;
    case "empty-b": return "Empty B"; break;
    case "transfer-a-b": return "Transfer A→B"; break;
    case "transfer-b-a": return "Transfer B→A"; break;
    default: return "???"; break;
  }
}

//convert search_tree result into Treant tree
function createNodes(node, search_tree, collapsed, isSolution=false) {
  node.text = {};
  node.text.name = `${search_tree.a.level}-${search_tree.b.level}`;
  node.collapsed = collapsed;
  node.children = [];
  
  //if it is on the path, mark it as solution-node
  if(search_tree.on_solution){
    node.HTMLclass = "solution-node";
  }
  
  //if it is the goal_node, mark it as such
  if(search_tree.is_solution){
    node.HTMLclass = "goal-node";
  }
  
  //if an operation was taken to get to this node (all but the first), assign it that class
  //this will be parsed later with getCommandName function
  if(search_tree.operation){
    node.HTMLclass += " operation" + search_tree.operation.num + " " + search_tree.operation.name;
  }
  

  //loop through all children of the search_tree's current node
  for (let i = 0; i < search_tree.children.length; i++) {
    //pass empty object to node (Treant Node)'s children by reference.
    let node_child = {};
    node.children.push(node_child);
    //now, when we call createNodes, the child is modified recursively by reference
    createNodes(node_child, search_tree.children[i], collapsed);
  }
  
  //don't set it to collapsed if it is a leaf node
  //otherwise it will get a collapse switch that does nothing
  if(!node.children.length){
    node.collapsed = false;
  }
}


//create a search object
function initializeSearch(search_type_override=""){
  //collect constraints from input form
  let Ljug_size = parseInt(document.getElementById("jug1-size").value);
  let Rjug_size = parseInt(document.getElementById("jug2-size").value);
  let Lgoal = parseInt(document.getElementById("Lgoal-state").value);
  let Rgoal = parseInt(document.getElementById("Rgoal-state").value);
  
  //if Jug A's goal is greater than its size
  if(Lgoal > Ljug_size) {
    alert("Jug A's goal level cannot be greater than its size.");
    return;
  } 
  
  //if Jug B's goal is greater than its size
  if(Rgoal > Rjug_size) {
    alert("Jug B's goal level cannot be greater than its size.");
    return;
  } 
  
  //no negative inputs
  if (Lgoal < 0 || Rgoal < 0 || Ljug_size < 0 || Rjug_size < 0) {
    alert("Please enter positive integers for Jug goal and size.\nEnter 0 for goal if you don't care what end value that jug has.");
    return;
  }
  
  //can't have both goals as 0
  if (Lgoal === 0 && Rgoal === 0) {
    alert("Please enter at least 1 non-zero goal.");
    return;
  };

  let goal = {};
  if (Lgoal) goal.a = Lgoal;
  if (Rgoal) goal.b = Rgoal;

  let search_type = "DFS";
  if (document.getElementById("BFS").checked) {
    search_type = "BFS";
  }
  
  if(search_type_override) search_type = search_type_override;
  
  return new Search(search_type, Ljug_size, Rjug_size, goal);
}



function createTree(search, collapsed){
  
  //run search and measure performance
  let start = performance.now();
  let [result, goal_node] = runSearch(search);
  let end = performance.now();
  let temp = NODES_CHECKED;
  NODES_CHECKED = 0;
  let time = end - start;
  //if the search exited early, there was an error, also exit early
  if(!result || !goal_node) return;
  
  //reset the html elements that had the tree in it so it can be rebuilt again
  $("#treeContainer").remove();
  $("#infoDiv").remove();
  $("#treeWrapper").prepend('<div id="treeContainer"></div>');
  //give tree container dragging scroll functionality
  initializeContainerDrag('treeContainer');
  
  //go up the chain from the goal_node to mark what is on the
  //solution path
  let solution_length = 1;
  goal_node.is_solution = true;
  while(goal_node.cameFrom){
    goal_node.on_solution = true;
    goal_node = goal_node.cameFrom;
    solution_length ++;
  }
  //mark starting spot since it is always part of solution
  goal_node.on_solution = true;


  //convert search_tree into Treant tree
  let nodes = {};
  createNodes(nodes, result, collapsed);


  let config = {
    chart: {
      container: "#treeContainer",
      callback: {
      },
      rootOrientation: "NORTH",
      scrollbar: "fancy",
      animateOnInit: true,
      animateOnInitDelay:0,
      levelSeparation: 60,
      siblingSeparation: 30,

      connectors: {
        type: "step",
        style: {
          //"arrow-end": "classic-wide-long",
          "stroke-width": 2
        }
      },
      node: {
        collapsable: true,
      },
      animation: {
        nodeSpeed: 600,
        nodeAnimation: "linear",
        connectorsSpeed: 600,
        connectorsAnimation: "linear"
      }
    },

    nodeStructure: nodes
  };


  TREE = new Treant(config, function(){}, $);
  
  //add performance info to top right of container
  $("#treeWrapper").prepend(`<div id="infoDiv" style="position:absolute; top: 10px; text-align:right; right: 20px; font-size:1vw; z-index: 10;">
                                <p>Search took ${(time).toFixed(3)} milliseconds</p>
                                <p>Search checked ${temp} nodes</p>
                              </div>`);
  
  //default text if there was no solution
  if(solution_length > 1)
    $("#infoDiv").append(`<p>Solution is ${solution_length} nodes long</p>`)
  else
    $("#infoDiv").append(`<p>No solution found.`);

  //mark everything without a collapse switch as a leaf node
  $('.node').not(":has(a)").addClass("leaf-node");
  
  //loop through each node and display the action
  $('.node').each(function(){
    let classes = $(this).attr('class').split(/\s+/);
    if(classes.length < 4) return;
    $(this).prepend(`<span style="position:absolute; top:5px; left:5px; font-size:12px;">${getCommandName(classes[3])}</span>`);
  });
}


//given a search object from initializeSearch(), runs search and returns the search_tree
//as an array of the pointer to the root node, and the goal_node
function runSearch(search) {
  
  if(search.actions_.length != 6){
    alert("Please make sure there are no duplicate rankings for the actions.");
    return [0,0];
  }
  let result = search.search();
  return [search.states, search.goal_node];
}



//runs when the page has finished initializing
$(document).ready(function() {

  //add event listener to collapseAll/uncollapseAll button
  $("#toggleCollapseButton").on("click", function(){
    let search = initializeSearch(SEARCH_TYPE);
    let should_collapse = $(this).hasClass("collapse-all");
    createTree(search, should_collapse);
    
    //display the appropriate new text
    if(should_collapse){
      $(this).html("Uncollapse All");
    } else {
      $(this).html("Collapse All");
    }
    
    $(this).toggleClass("collapse-all");
  });
  
  
  document.getElementById("search").addEventListener("click", function() {
    let search = initializeSearch();
    SEARCH_TYPE = search.type;
    document.body.style.cursor = "wait";
    createTree(search, false);
    document.body.style.cursor = "default";

    //make sure collapse all button is appropriately labeled
    let should_collapse = $("#toggleCollapseButton").hasClass("collapse-all");
    if(!should_collapse){
      $("#toggleCollapseButton").html("Collapse All");
      $("#toggleCollapseButton").addClass("collapse-all");
    } 
  });
  
  //create the default tree
  createTree(initializeSearch(), false);
  
  //let myp5 = new p5(sketch);
});



//Div drag functionality taken from: 
//https://github.com/phuoc-ng/html-dom/blob/master/demo/drag-to-scroll/index.html
function initializeContainerDrag(container_id){
  const ele = document.getElementById(container_id);
    ele.style.cursor = 'grab';

    let pos = { top: 0, left: 0, x: 0, y: 0 };

    const mouseDownHandler = function(e) {
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';

        pos = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function(e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;
    };
  
    const mouseUpHandler = function() {
        ele.style.cursor = 'grab';
        ele.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Attach the handler
    ele.addEventListener('mousedown', mouseDownHandler);
}