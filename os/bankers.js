let available = [];
    let allocMatrix = [];
    let maxMatrix = [];
    let needMatrix = [];

    function parseInput(numProcesses, numResources, availableStr, maxStr, allocStr) {
      available = availableStr.split(',').map(Number);
      maxMatrix = maxStr.split(';').map(row => row.split(',').map(Number));
      allocMatrix = allocStr.split(';').map(row => row.split(',').map(Number));

      needMatrix = [];
      for (let i = 0; i < numProcesses; i++) {
        needMatrix[i] = [];
        for (let j = 0; j < numResources; j++) {
          needMatrix[i][j] = maxMatrix[i][j] - allocMatrix[i][j];
        }
      }
    }

    function isSafe(avail, alloc, need) {
      const work = [...avail];
      const finish = Array(alloc.length).fill(false);
      const sequence = [];

      let madeProgress = true;
      while (sequence.length < alloc.length && madeProgress) {
        madeProgress = false;
        for (let i = 0; i < alloc.length; i++) {
          if (!finish[i]) {
            let canAllocate = true;
            for (let j = 0; j < work.length; j++) {
              if (need[i][j] > work[j]) {
                canAllocate = false;
                break;
              }
            }
            if (canAllocate) {
              for (let j = 0; j < work.length; j++) {
                work[j] += alloc[i][j];
              }
              sequence.push(i);
              finish[i] = true;
              madeProgress = true;
            }
          }
        }
      }

      return {
        safe: finish.every(f => f),
        sequence
      };
    }

    function handleRequest(processId, requestVector) {
      if (processId >= allocMatrix.length || requestVector.length !== available.length) {
        return { error: 'Invalid process ID or request vector length.' };
      }

      for (let i = 0; i < requestVector.length; i++) {
        if (requestVector[i] > needMatrix[processId][i]) {
          return {
            error: `Error: Process ${processId} has exceeded its maximum claim`
          };
        }
        if (requestVector[i] > available[i]) {
          return {
            error: `Error: Not enough resources available for resource ${i}`
          };
        }
      }

      const tempAvailable = [...available];
      const tempAlloc = allocMatrix.map(row => [...row]);
      const tempNeed = needMatrix.map(row => [...row]);

      for (let i = 0; i < requestVector.length; i++) {
        tempAvailable[i] -= requestVector[i];
        tempAlloc[processId][i] += requestVector[i];
        tempNeed[processId][i] -= requestVector[i];
      }

      const result = isSafe(tempAvailable, tempAlloc, tempNeed);

      if (result.safe) {
        available = tempAvailable;
        allocMatrix = tempAlloc;
        needMatrix = tempNeed;

        return {
          success: true,
          sequence: result.sequence
        };
      } else {
        return {
          success: false,
          message: 'Request denied. Would lead to unsafe state.'
        };
      }
    }

    function submitRequest() {
      const pid = document.getElementById("process-id").value;
      const req = document.getElementById("request-vector").value;
      const result = handleRequest(parseInt(pid), req.split(',').map(Number));

      const requestBox = document.getElementById("request-box");
      const safetyBox = document.getElementById("safety-box");

      if (result.error) {
        requestBox.innerHTML = result.error;
        safetyBox.innerHTML = "";
      } else if (!result.success) {
        requestBox.innerHTML = result.message;
        safetyBox.innerHTML = "";
      } else {
        requestBox.innerHTML = `Request granted.`;
        safetyBox.innerHTML = `The system is in a safe state.<br>Safe sequence: ${result.sequence.join(' → ')}`;
      }
    }

    // Initialize system state
    parseInput(
      5, 3,
      '3,3,2',
      '7,5,3;3,2,2;9,0,2;2,2,2;4,3,3',
      '0,1,0;2,0,0;3,0,2;2,1,1;0,0,2'
    );