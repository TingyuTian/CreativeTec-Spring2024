import discord
import nltk
from discord.ui import View
import os
import random

breakfastInclude = False

breakfastList = [
  "pancake",
  "waffle",
  "eggs",
  "bacon",
  "toast",
  "cereal",
  "oatmeal",
  "fruit",
  "sausage",
  "bacon",
  "mushrooms",
  "baked beans",
  "toast",
  "tomatoes",
  "banana bread",
  "scrambled eggs",
  "crepe",
  "scones",
  "chia pudding",
  "overnight oats",
  "avocado toast",
  "french toast",
]
timeList = ["morning", "afternoon", "evening", "night"]
verbList = [
  "eat", "drink", "sleep on", "play", "walk on", "run on", "jump on",
  "swim in", "write on", "climb", "taste", "smell", "feel", "love", "desire",
  "cook"
]

random_breakfast = random.choice(breakfastList)
random_time = random.choice(timeList)
random_verb = random.choice(verbList)

inParallelWord = f"In a parallel word, you {random_verb} a {random_breakfast} in {random_time}."

# print(inParallelWord)

#discord
intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)


class MyCustomView(View):

  def __init__(self):
    super().__init__()

  # adding button code
  @discord.ui.button(label="Press the Button")
  async def myButtonCallback(self, interaction, button):
    await interaction.response.send_message("Thanks!")


def analyzeAnswer(message_words):
  global breakfastInclude
  # Check if any word in the message matches an item in the breakfastList
  for word in message_words:
    if word in breakfastList:
      breakfastInclude = True
      return word  # Stop checking after the first match


# Print to the console when everything has connected properly


@client.event
async def on_ready():
  print(f'We have logged in as {client.user}')


# Main function that you will want to edit. Listens for messages, and does something based on it.
@client.event
async def on_message(message):

  def isAuthorSame(m):
    return m.author == message.author

  # Check to make sure the bot isn't the one who sent the message
  if message.author == client.user:
    return

  if client.user in message.mentions:
    await message.channel.send("What did you eat for break fast?")
    followup_message = await client.wait_for('message',
                                             check=isAuthorSame,
                                             timeout=60.0)
    # Split the message into words and convert to lowercase for case-insensitive comparison
    message_words = followup_message.content.lower().split()

    word = analyzeAnswer(message_words)
    if breakfastInclude == True:
      await message.channel.send(
        f"I see, you eat {word} in this world. {inParallelWord}")

  # # Logic for how the bot should respond
  # if message.content.startswith('$basicbot'):
  #   # Create a MyCustomView object to send
  #   view = MyCustomView()
  #   # Send a message in response
  #   await message.channel.send('Hello!', view=view)


# keep_alive()
token = os.getenv("DISCORD_BOT_SECRET")
client.run(token)
