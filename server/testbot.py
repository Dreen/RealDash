from RequestBot import Bot
from time import time

bot = Bot()

runtime = 700
started = int(time())
elapsed = 0
lastela = elapsed

bot.start()
while not bot.running:
	pass

while bot.running:
	elapsed = int(time()) - started
	if elapsed == runtime:
		print 'closing'
		bot.close()
	else:
		if elapsed != lastela:
			print elapsed
			lastela = elapsed
