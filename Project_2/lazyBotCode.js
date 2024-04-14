import os
import discord
from discord.ui import View, Select

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

#Dropdown Menu
class MyDropdown(Select):
  def __init__(self):
      # Set the options that will be presented inside the dropdown
      options = [
          discord.SelectOption(label="$1000", description="Great!"),
          discord.SelectOption(label="$200", description="Nah..."),
          discord.SelectOption(label="$500", description="Okay."),
      ]
      super().__init__(placeholder="Choose one to avoid punishments.", min_values=1, max_values=1, options=options)

  async def callback(self, interaction: discord.Interaction):
      # This function gets called when the user selects an option

      selectedValue = self.values[0] # This will get the value of the selected option
      if selectedValue == "$1000":
        response = "Great! You're safe now. Congraulations!"
      elif selectedValue == "$200":
        response = "Huh，watch out next time!"
      elif selectedValue == "$500":
        response = "Accepted. You can leave."
      await interaction.response.send_message(response)


#Button
class AnotherView(View):
  
    def __init__(self):
      super().__init__()

      #Add Dropdown Menu
      self.add_item(MyDropdown())
  
    @discord.ui.button(label="Click me! (Don't)")
    async def button_callback(self,interaction, button):
      await interaction.response.send_message("Sorry, you clicked the button. Punishments coming...")
  
    @discord.ui.button(label="Don't Click me!")
    async def button_callback2(self, interaction, button):
      await interaction.response.send_message("Why you clicked the button? Punishments coming...")
  
    @discord.ui.button(label="Don't bother me..")
    async def button_callback3(self, interaction, button):
      await interaction.response.send_message("How Dare You? Punishments coming...")
  
    @discord.ui.button(label="Please don't click me..")
    async def button_callback4(self, interaction, button):
      await interaction.response.send_message("You are dead for sure..")


@client.event
async def on_ready():
  print("Bot is Ready")


@client.event
async def on_message(message):
  if message.author == client.user:
    return

  if client.user in message.mentions:
    ourview = AnotherView()
    await message.channel.send("Time to work...omg, money coming, money coming", view=ourview)

  if message.content.startswith("$basicbot"):
    ourview = AnotherView()
    await message.channel.send("Hello, I'm a Lazy&Greedy bot", view=ourview)
    return


my_secret = os.environ['DISCORD_BOT_SECRET']
client.run(my_secret)


