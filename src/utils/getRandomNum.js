export default function getRandomNum (mean, std) {
  return mean + (Math.round(std * 2 * Math.random()) - std)
}
