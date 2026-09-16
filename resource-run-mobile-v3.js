/* Resource Run mobile refinement v3 */
(function(){
  const baseMakeFlow = makeFlow;
  const baseRenderGame = renderGame;

  makeFlow = function(s){
    const result = baseMakeFlow(s);
    if(result && result[0]){
      result[0].prompt = `A need for ${s.qty} ${s.resource} is identified. What happens first?`;
    }
    return result;
  };

  renderGame = function(){
    baseRenderGame();
    syncIMHModal();
  };

  function syncIMHModal(){
    const text = document.getElementById('imhModalText');
    const stepLabel = document.getElementById('imhModalStep');
    if(!text || !flow || !flow[step]) return;
    text.textContent = flow[step].imh;
    if(stepLabel) stepLabel.textContent = `CURRENT STEP · ${step + 1} OF ${flow.length}`;
  }

  window.openIMHModal = function(){
    syncIMHModal();
    const modal = document.getElementById('imhModal');
    if(modal) modal.classList.add('show');
    beep(520,.05);
  };

  window.closeIMHModal = function(){
    const modal = document.getElementById('imhModal');
    if(modal) modal.classList.remove('show');
  };

  win = function(){
    setVehicleZone('Field');
    setScreen('win');
    document.getElementById('finalScore').textContent = `FINAL SCORE ${score.toLocaleString()} · BEST STREAK ${streak}x`;
    document.getElementById('winText').textContent = `${scenario.qty} ${scenario.resource} successfully routed to ${scenario.final}. Start another assignment and the scenario will change.`;
    fanfare();
  };
})();
