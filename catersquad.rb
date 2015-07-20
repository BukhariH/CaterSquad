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

  get "/participant" do
    erb :participant
  end

  get "/restaurant" do
    erb :restaurant
  end

  get "/api/meals.json" do
    content_type :json
    events = DB[:events]
    price_limit = events.where(:id => params["event_id"]).first[:prperson]
    DB["SELECT restaurants.id, restaurants.image, restaurants.description, restaurants.title, meals.title, meals.description, meals.image, meals.price, meals.id, meals.restaurant_id FROM public.restaurants, public.meals WHERE meals.restaurant_id = restaurants.id AND meals.price <= #{price_limit};"].all.to_json

  end

end
