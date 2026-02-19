function resolveMult(diff) {
  switch(diff){
    case "easy":
      return 1
    case "medium":
      return 1.5
    case "hard":
      return 2
    default:
      return 0
  }
}

module.exports = async function scoreUser(user, game) {
  let score = 0;

  for(let i = 0; i < user.missions.length; i++) {
    if(user.missions[i].completed) score += Math.round(1000 * resolveMult(user.missions[i].difficulty)) + Math.round((game.endTime.getTime() - user.missions[i].completedAt.getTime()) * 50 / 60000)
  }

  return score
}