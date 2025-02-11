import asyncio
import random
import time
import socketio
# Create a Socket.IO client instance
sio = socketio.Client()

PLAYER_NAME_1 = "Bin"
GAME_ID_1 = "67ab06b2edb8b333b9555ba0"
@sio.event
def connect():
    print("✅ Connected to the server!")
    print(f"🔹 Joining game as {PLAYER_NAME_1}...")
    sio.emit("player_join_room", {"gameId": GAME_ID_1, "playerName": PLAYER_NAME_1})

@sio.on("player_join_room_error")
def on_player_join_room_error(error_message):
    print("Received 'PLAYER JOIN ROOM ERROR' event:")
    print(error_message)

@sio.on('timer_update')
def on_timer_update(data):
    print(data)
    print(f"��� Current timer: {data['timeLeft']} seconds")    

@sio.on("player_get_question")
def on_player_get_question(data):
    question_index = data["currentQuestionIndex"]
    print(f"\n�� Question {question_index + 1}: Answer now!")
    print(f"�� {data['question']}")
    print(data["answerList"])
    answer = random.choice(["1", "2", "3", "4"])

    playerAnswer = {
        "isAnswerd": True,
        "answer": answer,
        "time": (int(round(time.time() * 1000)) - data["timeStarted"])/1000
    }
    
    sio.emit("player_submit_answer", {
        "gameId": data["id"],
        "playerName": PLAYER_NAME_1,
        "playerAnswer": playerAnswer
    })
    print(f"�� Submitting answer: {answer}...") 

@sio.on("player_submit_answer_error")
def on_player_submit_answer_error(error_message):
    print("Received 'PLAYER SUBMIT ANSWER ERROR' event:")
    print(error_message)

@sio.on("player_current_leaderboard")
def on_player_current_leaderboard(data):
    print("\n�� Current Leaderboard:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")
    print("��� Waiting for next round...")

@sio.on("question_time_up")
def on_question_time_up(data):
    sio.emit("get_player_result", {"gameId": data["gameId"], "playerName": PLAYER_NAME_1})

@sio.on("player_result")
def on_player_result(data):
    print(data)

@sio.on("player_final_leaderboard")
def on_player_final_leaderboard(data):
    print("\n�� Final Leaderboard:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")

@sio.event
def disconnect():
    print("❌ Disconnected from the server.")

def main():
    sio.connect("http://localhost:4000")
    sio.wait()

if __name__ == "__main__":
    main()