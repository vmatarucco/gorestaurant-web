import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  // State que guarda todas as comidas da página
  const [foods, setFoods] = useState<IFoodPlate[]>([]);

  // State que guarda o objeto food que vai ser editado
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);

  // State que guarda o status (Aberto || Fechado) do modal de cadastro
  const [modalOpen, setModalOpen] = useState(false);

  // State que guarda o status (Aberto || Fechado) do modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      await api.get<IFoodPlate[]>('/foods').then(response => {
        // adiciona os valores ao state foods
        setFoods(response.data);
      });
    }
    // chamando a função
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      // var que recebe o objeto food e adiciona o campo available como true
      const addFood = { ...food, available: true };

      // var que recebe o retorno da requisição de insert
      const response = await api.post('/foods', addFood);

      // adiciona a nova food no state foods
      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { id, available } = editingFood;

    const updateFood = { id, ...food, available };

    const response = await api.put(`/foods/${id}`, updateFood);

    const tempArray = foods.map(currentFood => {
      if (currentFood.id === id) {
        return response.data;
      }

      return currentFood;
    });

    setFoods(tempArray);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    const deleteFood = await api.delete(`/foods/${id}`);

    const tempArray = foods.filter(currentFood => currentFood.id !== id);

    setFoods(tempArray);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />

      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
