require 'json'
require 'sequel'
require 'SecureRandom'
require 'digest/sha1'
require 'Date'

require 'mandrill'
mandrill = Mandrill::API.new 'smlwk6WCFKTbxU5hjOb3qg'

class Catersquad < Sinatra::Base
	
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
    restaurant_id = events.where(:id => part[:event_id]).first[:restaurant_id]
    meals_res = DB["SELECT * FROM public.meals WHERE meals.price <= 2000 AND meals.restaurant_id = 4 limit 5;"].all
    puts meals_res
    meals_res.to_json
  end

  get "/api/meals.json" do
    content_type :json
    
    rests = DB[:restaurants].all

    results = []
    rests.each do |rest|
      meals_res = DB["SELECT * FROM public.meals WHERE meals.price <= #{params["prperson"].to_i} limit 5;"].all
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
