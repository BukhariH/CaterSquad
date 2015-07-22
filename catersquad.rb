require 'json'
require 'sequel'
require 'securerandom'
require 'digest/sha1'
require 'date'
require 'httparty'

require 'sendgrid-ruby'


class Catersquad < Sinatra::Base
  @client = SendGrid::Client.new(api_user: 'bukharih', api_key: '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')

	DB = Sequel.connect('postgres://idzwaykrnfvkeu:qVtnOGJuUlME0UDDAyUjN_O8U5@ec2-54-228-180-92.eu-west-1.compute.amazonaws.com:5432/dbohuugivq02rr')

  set :public_folder => "public", :static => true

  get "/" do
    erb :manager
  end

  post "/" do
    content_type :json
   events = DB[:events]
   events.insert(:title => params["title"], :description => params["description"], :restaurant_id => params["restaurant_id"], :endDate => params["end"], :startDate => params["start"], :prperson => params["prperson"].to_i * 100)
    participants = params["participants"].split(',')
    event_id = events.where(:title => params["title"], :description => params["description"], :endDate => params["end"], :startDate => params["start"], :prperson => params["prperson"].to_i * 100).limit(1).first[:id]
    parts_db = DB[:participants]
    participants.each do |participant|
      hash = Digest::SHA1.hexdigest(participant + SecureRandom.hex)
      parts_db.insert(:email => participant, :hash => hash, :event_id => event_id, :meal_id => params["meal_id"])
      mail = <<-EOS
      Hey<br><br>
      You have been invited to:<br>
      <b>#{params["title"]}</b><br><br>
      #{params["description"].gsub(/[\r\n]+/, "<br>")}<br><br>
      The meeting will begin: <b>#{params["start"]}</b> and end: #{params["end"]}<br><br>
      Here's a link to pick your meal: <a href='http://app.catersquad.com/participant?hash=#{hash}'>http://app.catersquad.com/participant?hash=#{hash}</a><br><br>
      Best regards<br>
      CaterSquad
      EOS
      HTTParty.post("https://api.sendgrid.com/api/mail.send.json", query: {api_user: 'bukharih', api_key: 'ABN2a6jNCSvEGV6XFIYEX', to: participant, toname: participant, subject: 'Time to pick your meal!', html: mail,  from: 'hello@catersquad.com'})
    end

    {:status => "success", :event_id => event_id}.to_json
  end

  get "/participant" do
    erb :participant
  end

  get "/restaurant" do
    erb :restaurant
  end

  get "/api/participant.json" do
    content_type :json
    participants = DB[:participants]
    events = DB[:events]
    restaurants = DB[:restaurants]
    meals = DB[:meals]
    part = participants.where(:hash => params["hash"]).first
    rest = events.where(:id => part[:event_id]).first
    meals_res = DB["SELECT * FROM public.meals WHERE meals.price <= #{rest[:prperson]} AND meals.restaurant_id = #{rest[:restaurant_id]} limit 5;"].all
    puts meals_res
    meals_res.to_json
  end

  get "/api/meals.json" do
    content_type :json
    
    rests = DB[:restaurants].all

    results = []
    rests.each do |rest|
      meals_res = DB["SELECT * FROM public.meals WHERE meals.price <= #{params["prperson"].to_i} AND meals.restaurant_id = #{rest[:id]} limit 5;"].all
      # meals_res = meals.where(:price < params["prperson"].to_i).all
      results << {:restaurant => rest, :meals => meals_res}
    end

    results.to_json
  end

  post "/api/updateMeal.json" do
    content_type :json
    participants = DB[:participants]
    participants.where(:hash => params["hash"]).update(:meal_id => params["meal_id"])
    {:status => "success"}.to_json
  end

=begin
  There might be some mistakes here, since I don't know the exact structure of the DB nor the syntax.
=end
  post "/api/createMeal.json" do
    content_type :json
    meals = DB[:meals]
    meals.insert(:title => params["title"], :description => params["description"], :price => params["price"].to_i * 100, :image => params["image"], :restaurant_id => params["restaurant_id"])
    {:status => "success"}.to_json
  end

  get "/api/getMeals.json" do
    content_type :json
    meals = DB[:meals]
    meals.where(:restaurant_id => params["restaurant_id"]).all.to_json
  end

  post "/api/delMeals.json" do
    content_type :json
    meals = DB[:meals]
    meals.where(:id => params["meal_id"]).delete
    {:status => "success"}.to_json
  end

end
