from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

# Database connection function (to avoid connection leaks)
def get_db_connection():
    return pyodbc.connect(
        'DRIVER={SQL Server};'
        'SERVER=ANONYMOUS;'  
        'DATABASE=Scorer;'
        'Trusted_Connection=yes;' 
    )

@app.route('/login', methods=['POST'])
def login():
    try:
        request_data = request.get_json()
        email = request_data.get('email')
        password = request_data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[Validate_UserLogin] (?, ?)}", (email, password))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'error': 'Invalid credentials'}), 401
        else:
            user_id = result.UserId
            user_name = result.UserName
            user_email = result.UserEmail
            return jsonify({
                'message': 'Login successful',
                'userId': user_id,
                'userName': user_name,
                'email': user_email
            }), 200

    except Exception as e:
        print(f"Error processing login: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/get_seriesmasterData', methods=['GET'])
def get_seiesdata():
    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor = conn.cursor()
        cursor.execute("EXEC [msd].[SelectMatchSeriesMasterData]")
        
        series_data = []

        for row in cursor.fetchall():
            series_name = row.SeriesName
            series_location = row.SeriesLocation
            picture_url = row.PictureUrl
            series_id = row.SeriesId
            series_data.append({'SeriesId': series_id, 'SeriesName': series_name, 'SeriesLocation': series_location, 'PictureUrl': picture_url})

        print(series_data)
        return jsonify(series_data)
        
    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500
    
@app.route('/get_user_profile', methods=['GET'])
def get_user_profile():
    try:
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({'error': 'Missing userId parameter'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[Get_UserProfile] (?)}", (user_id,))

        series_list = []
        for row in cursor.fetchall():
            series_list.append({
                'seriesId': row.SeriesId,
                'seriesName': row.SeriesName,
                'seriesLocation': row.SeriesLocation,
                'pictureUrl': row.PictureUrl
            })

        cursor.nextset()
        user_details = cursor.fetchone()
        if user_details is None:
            return jsonify({'error': 'User details not found'}), 404
        
        profile = {
            'userId': user_details.UserId,
            'userName': user_details.UserName,
            'userEmail': user_details.UserEmail,
            'assignedSeries': series_list
        }

        return jsonify(profile), 200

    except Exception as e:
        print(f"Error fetching user profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/get_SeriesWisematches', methods=['GET'])
def get_series_match_details():
    try:

        seriesId = request.args.get('seriesId', type=int)
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[SelectMatchListDetails] ?", (seriesId))

        match_details = []

        for row in cursor.fetchall():
            match = {
                "MatchLocation": row.MatchLocation,
                "TeamA": row.TeamA,
                "TeamB": row.TeamB,
                "TeamAImage": row.TeamAImage,
                "TeamBImage": row.TeamBImage,
                "SeriesName": row.SeriesName,
                "MatchDate": row.MatchDate,
                "MatchTime": row.MatchTime,
                "MatchId": row.MatchId,
                "MatchStatus": row.MatchStatus
            }
            match_details.append(match)

            print(match_details)

        return jsonify(match_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_TeamDetails', methods=['GET'])
def get_team_details():
    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Select_TeamDetails]")

        team_details = []

        for row in cursor.fetchall():
            team = {
                "TeamLocation": row.TeamLocation,
                "TeamName": row.TeamName,
                "TeamPictureUrl": row.TeamPictureUrl,
                "TeamId": row.TeamId
            }
            team_details.append(team)

            print(team_details)

        return jsonify(team_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_TeamDetailsById', methods=['GET'])
def get_team_details_by_id():
    try:
        teamId = request.args.get('teamId', type=int)
        
        if teamId is None:
            return jsonify({"error": "teamId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[Select_TeamDataByTeamId] (?)}", (teamId,))

        team_details = cursor.fetchone()  

        print(team_details)

        if team_details is None:
            return jsonify({"error": "Team not found"}), 404

        team = {
            "TeamId": team_details.TeamId,
            "TeamName": team_details.TeamName,
            "TeamPictureUrl": team_details.TeamPictureUrl,
            "TeamLocation": team_details.TeamLocation
        }

        return jsonify(team), 200

    except Exception as e:
        error_message = f"Error fetching team details: {str(e)}"
        print(error_message)
        
        return jsonify({"error": error_message}), 500
    
@app.route('/add_teams', methods=['POST'])
def add_teams():
    try:
        request_data = request.get_json()

        team_Name = request_data['TeamName']
        team_location = request_data['TeamLocation']
        team_pictureurl = request_data['TeamPictureUrl']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[Insert_Teams] (?, ?, ?)}", 
                       (team_Name, team_location, team_pictureurl))

        conn.commit()

        response_data = {'message': 'Team inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        error_message = f"Error inserting data: {str(e)}"
        print(error_message) 
        return jsonify({'error': error_message}), 500


@app.route('/save_match', methods=['POST'])
def save_match():
    try:

        request_data = request.get_json()

        matchType = request_data['matchType']
        matchOvers = request_data['matchOvers']
        matchLocation = request_data['matchLocation']
        matchDateTime = request_data['matchDateTime']
        seriesId = request_data['seriesId']
        teamId = request_data['teamId']
        scorer_name = request_data['scorerName']

        conn = get_db_connection()
        cursor = conn.cursor()

        print(matchType, matchOvers, matchLocation, matchDateTime, seriesId, teamId, scorer_name)
        cursor.execute("{CALL [msd].[AddMatchDetails] (?, ?, ?, ?, ?, ?, ?)}", 
                       (matchType, matchOvers, matchLocation, matchDateTime, seriesId, teamId, scorer_name))
        
       
        conn.commit()

        response_data = {'message': 'Match inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        error_message = f"Error inserting data: {str(e)}"
        print(error_message) 
        return jsonify({'error': error_message}), 500
    
@app.route('/save_player', methods=['POST'])
def save_player():

    try:
        data = request.get_json()
        teamId = data['teamId']
        playername = data['playername']
        bowlingstyle = data['bowlingstyle']
        battingstyle = data['battingstyle']
        birthdate = data['birthdate']
        iswicketkeeper = data['iswicketkeeper']

        print(data)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("{CALL [msd].[Add_Player] (?, ?, ?, ?, ?, ?)}", (teamId, playername, bowlingstyle, battingstyle, birthdate, iswicketkeeper))

        conn.commit()

        response_data = {'message': 'Player inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        error_message = f"Error inserting data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500
    
@app.route('/get_Players')
def get_players_data():
    try:
        teamId = request.args.get('teamId', type=int)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [msd].[GetPlayerData] @teamId=?", (teamId,))


        player_data = []

        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'PlayerName':player_name,
                'PlayerId': player_id}
                )

        print(player_data)
        return jsonify(player_data)

    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500
    
@app.route('/deleteMatchById', methods=['POST'])
def deleteMatch():
    try:
        request_data = request.get_json()
        matchId = request_data.get('matchId')

        if not matchId:
            return jsonify({'error': 'matchId is required'}), 400 

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[DeleteMatch] (?)}", (matchId))

        conn.commit()
        
        return jsonify({'message': 'Delete successful'}), 200  

    except Exception as e:
        print(f"Error processing deletion: {str(e)}")
        return jsonify({'error': str(e)}), 500  
    
@app.route('/get_MatchDetailsByMatchId', methods=['GET'])
def get_match_detailsbyId():
    try:
        matchId = request.args.get('matchId')  
        
        if not matchId:
            return jsonify({"error": "Match ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Select_MatchDetailsFromMatchId] ?", (matchId))
        match_details = []

        for row in cursor.fetchall():
            match = {
                "HomeTeamId": row.HomeTeamId,
                "VisitorsTeamId": row.VisitorsTeamId,
                "Home": row.Home,
                "Visitors": row.Visitors,
                "HomePictureUrl": row.HomePictureUrl,
                "VisitorsPictureUrl": row.VisitorsPictureUrl,
            }
            match_details.append(match)

        print(match_details)

        return jsonify(match_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        return jsonify({"error": error_message}), 500

@app.route('/saveTossDetails', methods=['POST'])
def saveTossDetails():
    try:
        request_data = request.get_json()

        matchId = request_data.get('matchId')
        teamName = request_data.get('teamName')
        selectedOption = request_data.get('selectedOption')

        if not matchId or not teamName or not selectedOption:
            return jsonify({'error': 'matchId, teamId, and selectedOption are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Update_MatchTossDetails] ?, ?, ?", (matchId, teamName, selectedOption))

        conn.commit()

        return jsonify({'message': 'Toss details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing toss details: {str(e)}")
        return jsonify({'error': str(e)}), 500 

@app.route('/get_PlayersByTeamName', methods=['GET'])
def get_players_data_by_team_name():
    try:
        teamName = request.args.get('teamName')  
        conn = get_db_connection()  
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[GetPlayerDataByTeamName] @teamName=?", (teamName,))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  
        return jsonify(player_data)  
    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500  

@app.route('/get_PlayersByTeamId', methods=['GET'])
def get_players_data_by_team_Id():
    try:
        teamId = request.args.get('teamId', type=int)  
        matchId = request.args.get('matchId', type=int)  

        conn = get_db_connection()  
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[GetPlayerDataByTeamId] @TeamId=?, @MatchId=?", (teamId, matchId))

        player_data = []

        for row in cursor.fetchall():
            player_id = row[0]  
            player_name = row[1]  
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  

        return jsonify(player_data)  

    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500  
    
@app.route('/get_BattersByTeamId', methods=['GET'])
def get_batters_data_by_team_Id():
    try:
        teamId = request.args.get('teamId', type=int)  
        matchId = request.args.get('matchId', type=int)  

        conn = get_db_connection()  
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[GetBattersByTeamId]  @TeamId=?, @MatchId=?", (teamId, matchId))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_id = row[0]  
            player_name = row[1] 
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  
        return jsonify(player_data)  

    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500  

@app.route('/get_bowlers', methods=['GET']) 
def get_bowlers_match_id():
    try:
        matchId = request.args.get('matchId')  
        conn = get_db_connection() 
        cursor = conn.cursor()
        
        cursor.execute("EXEC [msd].[GetPlayerDataByMatchId] @matchId=?", (matchId))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  

        return jsonify(player_data)  

    except Exception as e:
        
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500  

@app.route('/save_selectedplayerdata', methods=['POST'])
def save_match_starting_data():
    try:
        data = request.json
        match_id = data['matchId']
        selected_batter_ids = data['selectedBatterIds']
        selected_bowler_id = data['selectedBowlerId']

        if not match_id or not selected_batter_ids or not selected_bowler_id:
            return jsonify({"error": "Missing required data"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        for batter_id in selected_batter_ids:
            cursor.execute("EXEC [msd].[InsertSelectedBatter] @matchId=?, @batterId=?", (match_id, batter_id))

        cursor.execute("EXEC [msd].[InsertSelectedBowler] @matchId=?, @bowlerId=?", (match_id, selected_bowler_id))

        conn.commit()
        cursor.close()

        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/save_selectedNewBowler', methods=['POST'])
def save_selectedNewBowle():
    try:
        data = request.json
        match_id = data['matchId']
        selected_bowler_id = data['selectedBowlerId']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[InsertNewSelectedBowler] @matchId=?, @bowlerId=?", (match_id, selected_bowler_id))

        conn.commit()
        cursor.close()

        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_selectedNewBatsman', methods=['POST'])
def save_new_Batsaman_data():
    try:
        data = request.json
        match_id = data.get('matchId') 
        selected_batter_ids = data.get('selectedBatterIds')

        print(f"Received match_id: {match_id}")
        print(f"Received selected_batter_ids: {selected_batter_ids}")

        if not match_id or not selected_batter_ids:
            return jsonify({"error": "Missing required data"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        print(f"Processing the following batter IDs: {selected_batter_ids}")

        for batter_id in selected_batter_ids:
            cursor.execute("EXEC [msd].[InsertSelectedNewBatter] @matchId=?, @batterId=?", (match_id, batter_id))

        conn.commit()
        cursor.close()

        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/get_matchstartingdata', methods=['GET'])
def get_match_staring_data():
    try:
        matchId = request.args.get('matchId')  
        conn = get_db_connection()  
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[GetMatchStartingDataByMatchId] @MatchId=?", (matchId,))


        batsmen_data = []
        bowlers_data = []
        totalScore = 0 
        wickets = 0
        overCount = 0
        ballsForOver = 0

        # Fetch batsman data
        batsman_result = cursor.fetchall()
        for row in batsman_result:
            batsmen_data.append({
                'batsmanId': row.BatsmanId,
                'batsmanName': row.BatsmanName,
                'battingTeamId': row.BattingTeamId,
                'runs': row.Runs,
                'balls': row.Balls,
                'fours': row.Fours,
                'sixes': row.Sixes
            })

        cursor.nextset()

        # Fetch bowler data
        bowler_result = cursor.fetchall()
        for row in bowler_result:
            bowlers_data.append({
                'bowlerId': row.BowlerId,
                'bowlerName': row.BowlerName,
                'bowlingTeamId': row.BowlingTeamId,
                'overs': row.Overs,
                'balls': row.Balls,
                'maidens': row.Maidens,
                'runs': row.Runs,
                'wickets': row.Wickets
            })

        cursor.nextset()

        # Fetch total score
        total_score_result = cursor.fetchone()
        if total_score_result:
            totalScore = total_score_result.TotalScore  # Extract total runs

        cursor.nextset()

        # Fetch total score
        total_wickets_result = cursor.fetchone()
        if total_score_result:
            wickets = total_wickets_result.Wickets  # Extract total runs

        cursor.nextset()

        # Fetch total score
        total_overs_result = cursor.fetchone()
        if total_score_result:
            overCount = total_overs_result.OverCount  # Extract total runs


        cursor.nextset()

        # Fetch total score
        total_balls_per_over_result = cursor.fetchone()
        if total_score_result:
            ballsForOver = total_balls_per_over_result.BallsForOver  # Extract total runs

        cursor.nextset()
        
        match_between_data = cursor.fetchone()
        if total_score_result: 
            matchBetweenResult = match_between_data.MatchBetween   

        cursor.nextset()
        
        match_batting_data = cursor.fetchone()
        if total_score_result: 
            battingTeam = match_batting_data.BattingTeam 
        
        cursor.close()  

        return jsonify({
            'batsmen': batsmen_data,
            'bowlers': bowlers_data,
            'totalScore': totalScore,
            'wickets': wickets,
            'overCount': overCount,
            'ballsForOver': ballsForOver,
            'matchBetween': matchBetweenResult,
            'battingTeam': battingTeam,
             
        })

    except Exception as e:
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500 
  
@app.route('/add_series', methods=['POST'])
def add_series():
    try:

        request_data = request.get_json()

        series_Name = request_data['SeriesName']
        series_location = request_data['SeriesLocation']
        series_pictureurl = request_data['PictureUrl']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("{CALL [msd].[AddSeries] (?, ?, ?)}", 
                       (series_Name, series_location, series_pictureurl))

        conn.commit()

        response_data = {'message': 'Team inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        error_message = f"Error inserting data: {str(e)}"
        print(error_message) 
        return jsonify({'error': error_message}), 500

@app.route('/AddBatsmanDismissal', methods=['POST'])
def AddBatsmanDismissal():
    try:
        request_data = request.get_json()

        matchId = request_data.get('matchId')
        playerId = request_data.get('playerId')
        teamId = request_data.get('teamId')
        dismissalType = request_data.get('dismissalType')

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Add_PlayerDismissal] ?, ?, ?, ?", (matchId, playerId, teamId, dismissalType))

        conn.commit()

        return jsonify({'message': 'Dismissal details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing toss details: {str(e)}")
        return jsonify({'error': str(e)}), 500  

@app.route('/AddRuns', methods=['POST'])
def AddRuns():
    try:
        request_data = request.get_json()

        print(request_data)

        matchId = request_data.get('matchId')
        batsmanId = request_data.get('batsmanId')
        bowlerId = request_data.get('bowlerId')
        battingTeamId = request_data.get('battingTeamId')
        bowlingTeamId = request_data.get('bowlingTeamId')
        batsmanRuns = request_data.get('batsmanRuns')
        batsmanBalls = request_data.get('batsmanBalls')
        batsmanFours = request_data.get('batsmanFours')
        batsmanSixes = request_data.get('batsmanSixes')
        runs = request_data.get('runs')
        isExtra = request_data.get('isExtra')  
        extraRuns = request_data.get('extraRuns', 0)  
        isBoundary = request_data.get('isBoundary')
        overs = request_data.get('overs') 
        ballsInOver = request_data.get('ballsInOver')  
        isBowlerExtra = request_data.get('isBowlerExtra')
        bowlersballs = request_data.get('bowlersballs')
        bowlerOvers = request_data.get('bowlerOvers')
        extraType = request_data.get('extraType')

        if not matchId or not batsmanId or runs is None:
            return jsonify({'error': 'Missing required fields'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Add_Runs] ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?", 
                       (matchId, bowlingTeamId, battingTeamId, batsmanId, batsmanRuns, batsmanBalls, batsmanFours, batsmanSixes, bowlerId, runs, isExtra, extraRuns, isBoundary, overs, ballsInOver, isBowlerExtra, bowlersballs, bowlerOvers, extraType))

        conn.commit()

        return jsonify({'message': 'Run details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing run: {str(e)}")
        return jsonify({'error': str(e)}), 500  

@app.route('/get_IsOverCompleted', methods=['GET'])
def get_IsOverCompleted():
    try:
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Get_OverCompletionData] ?", matchId)

        result = cursor.fetchone()

        if result:
            is_over_completed = result[0]
            return jsonify({"IsOverCompleted": is_over_completed}), 200
        else:
            return jsonify({"error": "No data found for the provided matchId"}), 404

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_NewInningsMatchData', methods=['GET'])
def get_NewInningsMatchData():
    try:
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Select_SecondBattingTeamDetails] ?", matchId)

        result = cursor.fetchone()

        if result:
            team_id = result[0]
            return jsonify({"TeamId": team_id}), 200
        else:
             return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:

        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_MatchEndData', methods=['GET'])
def get_MatchEndData():
    try:

        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[IsMatchOver] ?", matchId)

        result = cursor.fetchone()

        if result:
            IsMatchOver = result[0]
            return jsonify({"IsMatchOver": IsMatchOver}), 200
        else:
             return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_IsInningsCompleted', methods=['GET'])
def get_IsInningsCompleted():
    try:
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[IsInningsEnded] ?", matchId)

        result = cursor.fetchone()

        if result:
            is_match_overs = result[0]
            currently_bowled_overs = result[1]

            print(f"Fetched from DB: MatchDecidedOvers={is_match_overs}, CurrentlyBowledOvers={currently_bowled_overs}")

            return jsonify({
                "MatchDecidedOvers": is_match_overs,
                "CurrentlyBowledOvers": currently_bowled_overs
            }), 200
        else:
            return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching match details."}), 500

@app.route('/save_inningsEnd', methods=['POST'])
def update_IsInningsCompleted():
    try:
        matchId = request.json.get('matchId')  

        if not matchId:
            print("matchId is missing in the request body")
            return jsonify({"error": "matchId is required"}), 400

        print(f"Received matchId: {matchId}")  
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Update_MatchDetailsForInningsEnd] ?", matchId)

        conn.commit()

        return jsonify({'message': 'Inning End details saved successfully'}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching match details."}), 500

@app.route('/save_MatchEnd', methods=['POST'])
def update_save_MatchEnd():
    try:
        matchId = request.json.get('matchId')  

        if not matchId:
            print("matchId is missing in the request body")
            return jsonify({"error": "matchId is required"}), 400

        print(f"Received matchId: {matchId}")  

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC  [msd].[Update_MatchEndStatus] ?", matchId)

        conn.commit()

        return jsonify({'message': 'Inning End details saved successfully'}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching match details."}), 500


@app.route('/get_scorecarddata', methods=['GET'])
def get_match_scorecard_data():
    try:
        matchId = request.args.get('matchId')  
        

        if not matchId or not matchId.isdigit():
            return jsonify({'error': 'Invalid matchId parameter'}), 400

        matchId = int(matchId)
        
        conn = get_db_connection() 
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Select_MatchDetailsForScoreCard] @MatchId=?", (matchId,))

        team_data_availability = []
        team_a_batsman_details = []
        team_a_bowler_details = []
        team_a_summary_details = []
        team_a_partnership = []

        team_b_batsman_details = []
        team_b_bowler_details = []
        team_b_summary_details = []
        team_b_partnership = []

        team_data_result = cursor.fetchall()
        for row in team_data_result:
            team_data_availability.append({
                'IsFirstInnings': row.IsFirstInnings,
                'IsSecondInnings': row.IsSecondInnings,
            })
        cursor.nextset()  

        batsman_result = cursor.fetchall()
        for row in batsman_result:
            team_a_batsman_details.append({
                'TeamAName': row.TeamAName,
                'BatsmanName': row.BatsmanName,
                'Runs': row.Runs,
                'Balls': row.Balls,
                'Fours': row.Fours,
                'Sixes': row.Sixes,
                'StrikeRate': row.StrikeRate,
                'DismissalType': row.DismissalType
            })

        cursor.nextset()  

        bowler_result = cursor.fetchall()
        for row in bowler_result:
            team_a_bowler_details.append({
                'TeamBName': row.TeamBName,
                'BowlerName': row.BowlerName,
                'Overs': row.Overs,
                'Maidens': row.Maidens,
                'Runs': row.Runs,
                'Wickets': row.Wickets,
                'Average': row.Average
            })

        cursor.nextset()  

        summary_result = cursor.fetchall()
        for row in summary_result:
            team_a_summary_details.append({
                'Toss': row.Toss,
                'Runs': row.Runs,
                'Overs': row.Overs,
                'Wickets': row.Wickets,
                'Wides': row.Wides,
                'NoBalls': row.NoBalls,
                'Byes': row.Byes,
                'LegByes': row.LegByes,
                'Penalities': row.Penalities,
                'TotalExtras': row.TotalExtras
            })

        if team_data_availability and team_data_availability[0]['IsSecondInnings']:

            cursor.nextset() 

        partnership_result = cursor.fetchall()
        for row in partnership_result:
            team_a_partnership.append({
                'PartnershipRuns': row.PartnershipRuns,
                'PartnershipBalls': row.PartnershipBalls,
                'BatsmanAName': row.BatsmanAName,
                'BatsmanBName': row.BatsmanBName,
                'WicketNumber': row.WicketNumber
            })

            cursor.nextset() 

        batsman_result = cursor.fetchall()
        for row in batsman_result:
            team_b_batsman_details.append({
                'TeamBName': row.TeamBName,
                'BatsmanName': row.BatsmanName,
                'Runs': row.Runs,
                'Balls': row.Balls,
                'Fours': row.Fours,
                'Sixes': row.Sixes,
                'StrikeRate': row.StrikeRate,
                'DismissalType': row.DismissalType
            })

        if team_data_availability and team_data_availability[0]['IsSecondInnings']:

            cursor.nextset() 

        bowler_result = cursor.fetchall()
        for row in bowler_result:
            team_b_bowler_details.append({
                'TeamAName': row.TeamAName,
                'BowlerName': row.BowlerName,
                'Overs': row.Overs,
                'Maidens': row.Maidens,
                'Runs': row.Runs,
                'Wickets': row.Wickets,
                'Average': row.Average
            })

        if team_data_availability and team_data_availability[0]['IsSecondInnings']:

            cursor.nextset() 

        summary_result = cursor.fetchall()
        for row in summary_result:
            team_b_summary_details.append({
                'Toss': row.Toss,
                'Runs': row.Runs,
                'Overs': row.Overs,
                'Wickets': row.Wickets,
                'Wides': row.Wides,
                'NoBalls': row.NoBalls,
                'Byes': row.Byes,
                'LegByes': row.LegByes,
                'Penalities': row.Penalities,
                'TotalExtras': row.TotalExtras
            })

            cursor.nextset() 

        partnership_result = cursor.fetchall()
        for row in partnership_result:
            team_b_partnership.append({
                'PartnershipRuns': row.PartnershipRuns,
                'PartnershipBalls': row.PartnershipBalls,
                'BatsmanAName': row.BatsmanAName,
                'BatsmanBName': row.BatsmanBName,
                'WicketNumber': row.WicketNumber
            })

        cursor.close()  
        conn.close()  

        print(team_b_summary_details)

        return jsonify({
            'TeamDataAvailability': team_data_availability,
            'TeamABatsmanDetails': team_a_batsman_details,
            'TeamABowlerDetails': team_a_bowler_details,
            'TeamASummaryDetails': team_a_summary_details,
            'TeamAPartnershipDetails': team_a_partnership,
            'TeamBBatsmanDetails': team_b_batsman_details,
            'TeamBBowlerDetails': team_b_bowler_details,
            'TeamBSummaryDetails': team_b_summary_details,
            'TeamBPartnershipDetails': team_b_partnership,
        })

    except Exception as e:
        
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  
        return jsonify({'error': error_message}), 500  


# CORS Headers Fix
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
