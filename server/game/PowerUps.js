// ============================================================
// PowerUpManager — Handles power-up logic for all game modes
// Types: double, freeze, shield, extraShot
// ============================================================

class PowerUpManager {
  activate(type, team, state, mode) {
    switch (type) {
      case 'double':
        return this._doublePull(team, state, mode);
      case 'freeze':
        return this._freeze(team, state);
      case 'shield':
        return this._shield(team, state, mode);
      default:
        return { description: 'Unknown power-up' };
    }
  }

  // Double: next correct answer has 2x effect
  _doublePull(team, state, mode) {
    switch (mode) {
      case 'tug-of-war':
        if (team === 'red') state.ropePosition -= state.pullStrength;
        else state.ropePosition += state.pullStrength;
        return { type: 'double', description: `${team} team gets a DOUBLE PULL!`, immediate: true };

      case 'rocket-rush':
        if (team === 'red') state.redAltitude = Math.min(state.finishLine, state.redAltitude + state.boostAmount);
        else state.blueAltitude = Math.min(state.finishLine, state.blueAltitude + state.boostAmount);
        return { type: 'double', description: `${team} rocket gets DOUBLE BOOST!`, immediate: true };

      case 'catapult-clash':
        const enemy = team === 'red' ? 'blue' : 'red';
        if (enemy === 'red') state.redHealth = Math.max(0, state.redHealth - state.damage);
        else state.blueHealth = Math.max(0, state.blueHealth - state.damage);
        return { type: 'double', description: `${team} fires a DOUBLE SHOT!`, immediate: true };

      default:
        return { description: 'Double effect applied' };
    }
  }

  // Freeze: opponent team's answers don't count for 5 seconds
  _freeze(team, state) {
    const enemy = team === 'red' ? 'blue' : 'red';
    // The freeze flag is checked client-side + server-side
    state[`${enemy}Frozen`] = true;
    state[`${enemy}FreezeEnd`] = Date.now() + 5000;

    setTimeout(() => {
      state[`${enemy}Frozen`] = false;
      delete state[`${enemy}FreezeEnd`];
    }, 5000);

    return { type: 'freeze', description: `${enemy} team is FROZEN for 5 seconds!`, duration: 5000, target: enemy };
  }

  // Shield: block the next enemy correct-answer effect
  _shield(team, state, mode) {
    state[`${team}Shield`] = true;
    return { type: 'shield', description: `${team} team activated a SHIELD!`, team };
  }
}

module.exports = { PowerUpManager };
