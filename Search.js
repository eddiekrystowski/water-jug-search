/* global Jug NODES_CHECKED */

let NODES_CHECKED = 0;

//custom bind implementation to allow access to
//the boundArgs after the function is bound
function bind(fn, thisArg, ...boundArgs) {
  //build a closure
  const func = function(...args) {
    return fn.call(thisArg, ...boundArgs, ...args)
  }
  Object.defineProperties(func, {
    __boundArgs: { value: boundArgs },
    __thisArg: { value: thisArg },
    __boundFunction: { value: fn }
  })
  return func
}


class Search {
  constructor(type, a_size, b_size, solution){
    this.type = type;
    this.a = new Jug(a_size);
    this.b = new Jug(b_size);
    
    this.solution = solution;
    this.goal_node = {};
    //^^format:
    // {a: 1, b: 4}
    // {a: 3}
    // {b: 1}
    
    this.states = {};
    this.seen = {};
    
    //default action order
    this.actions_ = [
      bind(this.fill, this, 'a'),
      bind(this.fill, this, 'b'),
      bind(this.empty, this, 'a'),
      bind(this.empty, this, 'b'),
      bind(this.transfer, this, 'a', 'b'),
      bind(this.transfer, this, 'b', 'a')
    ];
    

    //shuffle action order based on inputs in form
    this.adjustActionPreferenceOrder();
  }
  
  //shuffle action order based on inputs in form
  adjustActionPreferenceOrder() {
    let new_actions = [];
    let values = $('.rank');
    
    let self = this;
    values.each(function(index) {
      let new_action = $(this).attr("data-action").split(" ");
      new_actions.push(bind(self[new_action[0]], self, ...new_action.slice(1)));
    });
    this.actions_ = new_actions;
  }
  
  
  //returns true if a state is the goal state.
  //false otherwise
  check(state){
    if(this.solution.a && state.a.level !== this.solution.a) return false;
    if(this.solution.b && state.b.level !== this.solution.b) return false;
    
    return true;
  }

  
  //-------------- STATE MANAGEMENT ---------------- //
  
  //makes a state out of the current values of the search object
  make_state(){
    return {
      a: this.a.copy(),
      b: this.b.copy(),
      children: []
    };
  }
  
  //makes a shallow copy of a state
  copy_state(state){
    return {
      a: state.a.copy(),
      b: state.b.copy(),
      children: []
    }
  }
  
  //marks a state as seen
  //Object property is formatted as "{a.level}-{b.level}"
  mark_state(state){
    this.seen[`${state.a.level}-${state.b.level}`] = true;
  }
  
  //returns true if state has already been marked/seen by this.mark_state()
  was_seen(state){
    return this.seen.hasOwnProperty(`${state.a.level}-${state.b.level}`);
  }
  
  
  //--------------- JUG OPERATIONS ---------------- //
  //returns the resulting state after performing empty operation on it
  //does not modify the original state
  empty(jug, state) {
    let new_state = this.copy_state(state);
    new_state[jug].level = 0;
    return new_state;
  }
  
  //returns the resulting state after performing fill operation on it
  //does not modify the original state
  fill(jug, state) {
    let new_state = this.copy_state(state);
    new_state[jug].level = new_state[jug].size;
    return new_state;
  }
  
  //returns the resulting state after performing transfer operation on it
  //does not modify the original state
  transfer(self, other, state){
    let new_state = this.copy_state(state);
    
    let amount = Math.min(new_state[self].level, new_state[other].size - new_state[other].level);
    
    new_state[other].level += new_state[self].level;
    new_state[other].level = Math.min(new_state[other].size, new_state[other].level);
    new_state[self].level -= amount;
    return new_state;
  }
  
  
  //------------------- SEARCHING --------------------- //
  
  //perform search based on this.type
  search(){
    //create first node as start state
    let current_state = this.make_state();
    this.states = current_state;
    NODES_CHECKED++;
    if(this.type == "DFS") {
      return this.DFS(current_state);
    }
    else {
      return this.BFS(current_state);
    } 
  }
  
  
  //DEPTH-FIRST-SEARCH
  DFS(current_state){
    
    //mark it as seen
    this.mark_state(current_state);
        
    //check if it is the answer
    if(this.check(current_state)){
      this.goal_node = current_state;
      return true;
    }
    
    //loop through all operations
    for(let i = 0; i < this.actions_.length; i++){
      let action = this.actions_[i];
      //perform action on curernt state
      let next_state = action(current_state);
      //let the next state know what its parent node is
      next_state.cameFrom = current_state;
      //keep track of the operation that was done so we can output it on the node
      next_state.operation = {
        num: i+1,
        name: action.__boundFunction.name + "-" + action.__boundArgs.join("-")
      };
      
      
      //if the action made no change to the state, skip it
      if (current_state.a.level === next_state.a.level &&
          current_state.b.level === next_state.b.level){
        continue;
      }
      
      NODES_CHECKED++;
    
      //add the next_state to current_state's children
      current_state.children.push(next_state);
      
      //if we have seen it before, don't keep searching from it.
      //We do, however, want to add it to the children (as done above) so the user can
      //see that we encountered a duplicate
      if(this.was_seen(next_state)) continue;
      
      //recursively call DFS on next_state
      let found = this.DFS(next_state);
      if(found) return true;
    }
    
    return false;
  }
  
  
  
  //Breadth-First-Search
  BFS(start){
    
    //initialize level arrays
    let current = [];
    let next = [];
    
    //add the start state to the current level
    current.push(start);
    
    //while we haven't ran out of things on the current level
    while (current.length !== 0) {
      //loop through the current level
      for (let i = 0; i < current.length; i++) {
        
        //skip if already seen
        if (this.was_seen(current[i])) continue; 
        
        //mark as seen
        this.mark_state(current[i]);
        
        //loop through all actions
        for (let j= 0; j < this.actions_.length; j++) {
          let action = this.actions_[j];
          //perform action on current_state
          let next_state = action(current[i]);
          //let the next_state know what its parent is
          next_state.cameFrom = current[i];
          //keep track of the operation so we can output it later
          next_state.operation = {
            num: j+1,
            name: action.__boundFunction.name + "-" + action.__boundArgs.join("-")
          };
          
          //if the action made no change to the state, skip it
          if (current[i].a.level === next_state.a.level &&
            current[i].b.level === next_state.b.level){
            continue;
          }
          
          //this state will be evaluated further on the next level
          next.push(next_state);
          NODES_CHECKED++;
          
          //add to current_state's children
          current[i].children.push(next_state);
          
          //return early if this child is the solution. 
          //no need to compute the rest of the next level
          if (this.check(next_state)) {
            this.goal_node = next_state;
            return true;
          }
        }
      }
      //copy next level into current level
      current = [...next];
      //empty next level
      next = [];
    }
    
    //goal not found
    return false;
  }
}