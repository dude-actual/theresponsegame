/* Resource Run mobile refinement v4 */
(function(){
  const baseMakeFlow = makeFlow;
  const baseRenderGame = renderGame;

  function quantifiedResource(s){
    if(!s) return '';
    if(String(s.qty) === '1') return s.resource;
    if(/s$/i.test(s.resource)) return s.resource;
    return s.resource + 's';
  }

  function isPlural(s){
    return String(s.qty) !== '1';
  }

  makeFlow = function(s){
    const result = baseMakeFlow(s);
    const label = quantifiedResource(s);
    const plural = isPlural(s);

    if(result && result[0]){
      result[0].prompt = `A need for ${s.qty} ${label} is identified. What happens first?`;
    }
    if(result && result[3]){
      result[3].prompt = s.available
        ? `The requested ${label} ${plural ? 'are' : 'is'} available internally. What is the best next move?`
        : `The requested ${label} ${plural ? 'are' : 'is'} NOT available internally. What is the best next move?`;
    }
    if(result && result[5]){
      result[5].prompt = `${label} ${plural ? 'arrive' : 'arrives'} or ${plural ? 'are' : 'is'} activated for incident use. What should happen before final assignment?`;
    }
    if(result && result[6]){
      result[6].prompt = `${label} ${plural ? 'are' : 'is'} ready for ${s.final}. What keeps the process complete?`;
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
    const label = quantifiedResource(scenario);
    document.getElementById('finalScore').textContent = `FINAL SCORE ${score.toLocaleString()} · BEST STREAK ${streak}x`;
    document.getElementById('winText').textContent = `${scenario.qty} ${label} successfully routed to ${scenario.final}. Start another assignment and the scenario will change.`;
    fanfare();
  };
})();
