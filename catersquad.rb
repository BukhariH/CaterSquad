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
   events.insert(:title => params["title"], :description => params["description"], :endDate => params["end"], :startDate => params["start"], :prperson => params["prperson"].to_i * 100)
    participants = params["participants"].split(',')
    event_id = events.where(:title => params["title"], :description => params["description"], :endDate => params["end"], :startDate => params["start"], :prperson => params["prperson"].to_i * 100).limit(1).first[:id]
    parts_db = DB[:participants]
    participants.each do |participant|
      hash = Digest::SHA1.hexdigest(participant + SecureRandom.hex)
      parts_db.insert(:email => participant, :hash => hash, :event_id => event_id)
    end

    {:status => "success", :event_id => event_id}
  end

  get "/participant/:hash" do

    # erb :participant
  end

  get "/restaurant" do
    erb :restaurant
  end

  get "/api/meals.json" do
    content_type :json
    
    rests = DB[:restaurants].all

    results = []
    rests.each do |rest|
      meals_res = DB["SELECT * FROM public.meals WHERE meals.price <= #{params["prperson"].to_i};"].limit(5).all
      # meals_res = meals.where(:price < params["prperson"].to_i).all
      results << {:restaurant => rest, :meals => meals_res}
    end

    results.to_json
  end

end
